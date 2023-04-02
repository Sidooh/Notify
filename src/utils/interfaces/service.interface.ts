import { Notification } from '@prisma/client';
import { SentMessageInfo } from 'nodemailer';

export default interface ServiceInterface {
    send(notifications: Notification[]): Promise<boolean | SentMessageInfo>;
}