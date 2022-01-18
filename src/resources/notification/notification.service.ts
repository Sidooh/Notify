import Notification from "@/models/notification.model";
import log from "@/utils/logger";
import {INotification} from "@/models/interfaces";

class NotificationService {
    // Create new notification
    async create(channel: string, destination: string, content: string, event_type: string): Promise<INotification> {
        try {
            return await Notification.create({channel, destination, content, event_type});
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
