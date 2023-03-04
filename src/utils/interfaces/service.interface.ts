import { Notification } from '@prisma/client';

export default interface ServiceInterface {
    send(notifications: Notification[]): Promise<any>;
}