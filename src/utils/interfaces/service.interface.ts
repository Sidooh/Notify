import { NotificationDoc } from '../../models/notification.model';

export default interface ServiceInterface {
    send(retry?: NotificationDoc): Promise<any>;
}