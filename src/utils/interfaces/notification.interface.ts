import { NotificationDoc } from '@/models/notification.model';

export default interface NotificationInterface {
    notification: NotificationDoc;

    send(retry?:boolean): Promise<boolean|void>;
}
