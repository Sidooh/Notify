import { log } from '../utils/logger';
import { Channel, Provider, Status } from '../utils/enums';
import { Mail } from '../channels/mail';
import { SMS } from '../channels/sms';
import { Slack } from '../channels/slack';
import { Help, SMSSettings } from '../utils/helpers';
import { BadRequestError } from '../exceptions/bad-request.err';
import { NotFoundError } from '../exceptions/not-found.err';
import { Notification as NotificationType, Prisma } from '@prisma/client';
import db from '../db/prisma';
import WaveSMSService from '../channels/sms/WaveSMS/WaveSMS.service';

const Notification = db.notification;
const Notifiable = db.notifiable;

export type NotificationIndexBuilder = { where?: Prisma.NotificationWhereInput, withRelations?: string }

export default class NotificationRepository {
    triedProviders: string[] = [];
    smsSettings: SMSSettings;

    index = async ({ where, withRelations }: NotificationIndexBuilder) => {
        const relations = withRelations?.split(',');

        try {
            return await Notification.findMany({
                select : {
                    id    : true, event_type: true, content: true, channel: true, destination: true,
                    status: true, created_at: true,

                    notifiables: relations?.includes('notifiables') && { select: { id: true, provider: true } }
                },
                where,
                orderBy: { id: 'desc' }
            });
        } catch (err) {
            log.error(err);

            throw new BadRequestError('Unable to fetch notifications!');
        }
    };

    find = async (id: bigint | number, withRelations?: string) => {
        const relations = withRelations?.split(',');

        const notification = await Notification.findUnique({
            where: { id }, include: { notifiables: relations?.includes('notifiables') }
        });

        if (!notification) throw new NotFoundError('Notification Not Found!');

        return notification;
    };

    findMany = async (args: Prisma.NotificationFindManyArgs) => {
        return await Notification.findMany(args);
    };

    update = async (data: Prisma.NotificationUpdateInput, where: Prisma.NotificationWhereUniqueInput) => {
        return await Notification.update({ data, where });
    };

    updateMany = async (data: Prisma.NotificationUpdateInput, where: Prisma.NotificationWhereInput) => {
        return await Notification.updateMany({ data, where });
    };

    notify = async (channel, content, event_type, destinations) => {
        log.info(`CREATE ${channel} NOTIFICATION for ${event_type}`);

        if (channel === Channel.SLACK) destinations = ['Sidooh'];
        if (!Array.isArray(destinations)) destinations = [destinations];

        const notifications = await db.$transaction(destinations.map(destination => Notification.create({
            data: { channel, destination, content, event_type }
        })));

        this.send(channel, notifications);

        return notifications;
    };

    send = async (channel: Channel | string, notifications: NotificationType[]): Promise<void | boolean> => {
        const destinations = notifications.map(n => n.destination);

        log.info(`SEND ${channel} NOTIFICATION to ${destinations.join(',')}`);

        let channelService;
        if (channel === Channel.MAIL) {
            channelService = new Mail(notifications);
        } else if (channel === Channel.SMS) {
            channelService = new SMS(notifications, await Help.getSMSSettings());
        } else {
            channelService = new Slack(notifications);
        }

        await channelService.send();
    };

    checkNotification = async (notification: NotificationType) => {
        // Check Notifiable
        let notifiables = await Notifiable.findMany({
            where: { notification_id: notification.id, status: { not: Status.COMPLETED } }
        });

        if (notifiables.length > 0) {
            for (const n of notifiables) {
                if (n.message_id && n.provider === Provider.WAVESMS) {
                    await this.queryStatus(n.id);
                }
            }
        } else {
            await this.send(notification.channel, [notification]);
        }

        return (await Notification.findUnique({ where: { id: notification.id } }))!;
    };

    handleCompleted = async (messageId: string) => {
        log.info('[NOTIFY]: Handle Completed Notification - ', { messageId });

        const notifiable = await Notifiable.findFirst({
            select: { id: true },
            where : { message_id: String(messageId) }
        });

        if (!notifiable) {
            return log.error('Notifiable Not Found!');
        }

        await Notifiable.update({
            where: { id: notifiable.id },
            data : {
                status      : Status.COMPLETED,
                notification: { update: { status: Status.COMPLETED } }
            }
        });
    };

    handleFailed = async (messageId: string) => {
        log.info('[NOTIFY]: Handle Failed Notification - ', { messageId });

        const notifiable = await Notifiable.findFirst({
            select: { id: true, notification_id: true, notification: true },
            where : { message_id: messageId, status: { not: Status.COMPLETED } }
        });

        if (!notifiable) {
            return log.error('Notifiable Not Found!');
        }

        await Notifiable.update({
            where: { id: notifiable.id },
            data : {
                status      : Status.FAILED,
                notification: { update: { status: Status.FAILED } }
            }
        });

        new SMS([notifiable.notification], await Help.getSMSSettings()).retry([notifiable.notification_id]);
    };

    queryStatus = async (notifiableId?: bigint) => {
        const process = async (notifiableId, messageId, provider) => {
            log.info(`Querying: ${messageId}`);

            const update = async (status: Status, data: Prisma.XOR<Prisma.NotifiableUpdateInput, Prisma.NotifiableUncheckedUpdateInput>) => {
                await Notifiable.update({
                    where: { id: notifiableId }, data: { status, notification: { update: { status } } }
                });
            };

            if (provider === Provider.WAVESMS) {
                try {
                    const report = await new WaveSMSService().query(messageId);

                    if (report.delivery_description === 'DeliveredToTerminal') {
                        await update(Status.COMPLETED, {
                            status_code: report.code,
                            description: report.delivery_description,
                            updated_at : report.delivery_time
                        });
                    } else if ([1007].includes(report.code)) {
                        await update(Status.FAILED, {
                            status_code: report.code,
                            description: report.delivery_description,
                            updated_at : report.delivery_time
                        });
                    }
                } catch (error) {
                    log.error(`Failed to report: ${messageId}`, { error });
                }
            }

            log.info(`Query Successful: ${messageId}`);
        };

        if (notifiableId) {
            const n = await Notifiable.findFirst({ where: { id: notifiableId, status: Status.PENDING } });

            if (!n) {
                return log.error('Nothing to Query!');
            }

            await process(n.id, n.message_id, n.provider);
        } else {
            const notifiables = await Notifiable.findMany({
                where: { status: Status.PENDING }
            });

            if (notifiables.length > 0) {
                for (const n of notifiables) {
                    if (n.message_id) {
                        await process(n.id, n.message_id, n.provider);
                    }
                }
            } else {
                log.error('Nothing to Query!');
            }
        }
    };
}