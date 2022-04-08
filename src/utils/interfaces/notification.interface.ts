import { NotificationAttrs } from '../../../models/notification';

export default interface NotificationInterface {
    notifications: NotificationAttrs | NotificationAttrs[];
    destinations?: string[];

    send(retry?: boolean): Promise<boolean | void>;
}
