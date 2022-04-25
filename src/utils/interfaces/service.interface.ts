import { Notification } from '../../models/Notification';

export default interface ServiceInterface {
    send(notifications: Notification[]): Promise<any>;
}