import Notification from "@/resources/notification/notification.model";
import INotification from "@/resources/notification/notification.interface";
import log from "@/utils/logger";

class NotificationService {
    // Create new notification
    async create(channel: string, destination: string, content: string): Promise<INotification> {
        try {
            return await Notification.create({channel, destination, content});
        } catch (e) {
            log.error(e)
            throw new Error('Unable to send notification')
        }
    }

    //  Update notification
    async update(notification: INotification) {
        try {
            return Notification.updateOne({_id: notification._id}, {$set: notification});
        } catch (e) {
            throw new Error('Unable to send notification')
        }
    }
}

export default NotificationService