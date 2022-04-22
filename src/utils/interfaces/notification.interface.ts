import { Notification } from '../../models/Notification';

export default interface NotificationInterface {
    notifications: Notification | Notification[];
    destinations?: string[];

    send(retry?: boolean): Promise<boolean | void>;
}
