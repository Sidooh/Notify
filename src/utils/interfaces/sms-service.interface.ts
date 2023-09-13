import { Notification } from '@prisma/client';
import { SMSNotificationResults } from '../types';

export default interface SmsServiceInterface {
    to(to: string[]): this;

    message(to: string): this;

    send(notifications: Notification[]): Promise<SMSNotificationResults | any>;
}