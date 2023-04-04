import { Notification } from '@prisma/client';
import { SMSNotificationResults } from '../types';

export default interface ServiceInterface {
    send(notifications: Notification[]): Promise<SMSNotificationResults | any>;
}