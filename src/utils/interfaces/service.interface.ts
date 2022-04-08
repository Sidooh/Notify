import { NotificationAttrs } from '../../../models/notification';

export default interface ServiceInterface {
    send(notifications: NotificationAttrs[]): Promise<any>;
}