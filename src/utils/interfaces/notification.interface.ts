import { Notification } from '@prisma/client';
import ServiceInterface from './service.interface';

export default interface NotificationInterface {
    notifications: Notification | Notification[];
    destinations?: string[];

    service: ServiceInterface;

    send(retry?: boolean): Promise<boolean | void>;
}
