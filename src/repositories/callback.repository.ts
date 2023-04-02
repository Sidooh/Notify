import prisma from '../db/prisma';
import { Status } from '../utils/enums';
import { log } from '../utils/logger';

const Notifiable = prisma.notifiable;

export class CallbackRepository {
    handleCompleted = async (messageId: string) => {
        log.info('[NOTIFY]: Handle Completed Notification - ', { messageId })

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
        log.info('[NOTIFY]: Handle Failed Notification - ', { messageId })

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

        // new SMS([notifiable.notification], await Help.getSMSSettings()).retry([notifiable.notification_id]);
    };
}