import Notification from "@/resources/notification/notification.model";
import INotification from "@/resources/notification/notification.interface";

class NotificationService {
    /*
    * Create new notification*/
    async create(title:string, body:string): Promise<INotification> {
        try {
            return await Notification.create({title, body});
        } catch (e) {
            throw new Error('Unable to create notification')
        }
    }
}

export default NotificationService