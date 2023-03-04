import { log } from '../utils/logger';
import { Channel } from '../utils/enums';
import { Mail } from '../channels/mail';
import SMS from '../channels/sms';
import Slack from '../channels/slack';
import { Help } from '../utils/helpers';
import { BadRequestError } from '../exceptions/bad-request.err';
import { NotFoundError } from '../exceptions/not-found.err';
import { Notification as NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

const Notification = prisma.notification;

export type NotificationIndexBuilder = { where?: Prisma.NotificationWhereInput, withRelations?: string }

export default class NotificationRepository {
    index = async ({ where, withRelations }: NotificationIndexBuilder) => {
        const relations = withRelations?.split(',');

        try {
            return await Notification.findMany({
                select : {
                    id    : true, event_type: true, content: true, channel: true, destination: true,
                    status: true, created_at: true,

                    notifiables: relations?.includes('notifiables')
                },
                where,
                orderBy: { id: 'desc' }
            });
        } catch (err) {
            log.error(err);

            throw new BadRequestError('Unable to fetch notifications!');
        }
    };

    find = async (id: number, withRelations?: string) => {
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

        const notifications = await prisma.$transaction(destinations.map(destination => Notification.create({
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
            channelService = new SMS(notifications, destinations, await Help.getSMSSettings());
        } else {
            channelService = new Slack(notifications);
        }

        await channelService.send();
    };
}