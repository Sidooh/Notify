import Notification from "@/resources/notification/notification.model";
import INotification from "@/resources/notification/notification.interface";

class NotificationService {
    // Create new notification
    async create(channel: string, to: string, content: string): Promise<INotification> {
        try {
            return await Notification.create({channel, to, content});
        } catch (e) {
            throw new Error('Unable to send notification')
        }
    }

    //  Send new notification
    async send(notification: Notification): Promise<INotification> {
        try {
            return await Notification.create(notification);
        } catch (e) {
            throw new Error('Unable to send notification')
        }
    }
}

export default NotificationService