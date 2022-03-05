import { Notification } from '@/models/notification.model';
import { log } from '@/utils/logger';
import { INotification } from '@/models/interfaces';
import { Schema } from 'mongoose';
import { BadRequestError } from '@nabz.tickets/common';

class NotificationService {
    // Fetch all notifications
    async fetchAll() {
        try {
            return await Notification.find({})
                .select(['id', 'destination', 'channel', 'event_type', 'content', 'provider', 'status', 'created_at', 'notifiable_type'])
                .sort('-_id').populate('notifiable_id', ['data']);
        } catch (err) {
            log.error(err);
            throw new BadRequestError('Unable to fetch notifications!');
        }
    }

    async findOne(id: Schema.Types.ObjectId | string) {
        try {
            return await Notification.findById(id).populate('notifiable_id', ['data']);
        } catch (err) {
            log.error(err);
            throw new BadRequestError('Unable to find notification!');
        }
    }

    // Create new notification
    async create(channel: string, destination: string, content: string, event_type: string): Promise<INotification> {
        try {
            log.info(`CREATE ${channel} NOTIFICATION: for ${event_type}`);

            if (channel === 'slack') destination = 'Sidooh';

            return await Notification.create({ channel, destination, content, event_type });
        } catch (e) {
            log.error(e);
            throw new BadRequestError('Unable to create notification!');
        }
    }

    //  Update notification
    async update(notification: INotification) {
        try {
            return Notification.updateOne({ _id: notification._id }, { $set: notification });
        } catch (e) {
            log.error(e);
            throw new BadRequestError('Unable to update notification!');
        }
    }
}

export default NotificationService;
