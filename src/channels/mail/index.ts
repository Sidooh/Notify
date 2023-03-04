import MailService from './mail.service';
import NotificationInterface from '../../utils/interfaces/notification.interface';
import { log } from '../../utils/logger';
import { Notification } from '@prisma/client';
import { Status } from '../../utils/enums';
import NotificationRepository from '../../repositories/notification.repository';

export class Mail implements NotificationInterface {
    notifications;
    service;

    constructor(notifications: Notification[]) {
        this.notifications = notifications;
        this.service = new MailService();
    }

    send = async () => {
        this.notifications.forEach(notification => {
            this.service.from('sidooh@gmail.com')
                .to(notification.destination)
                .html(notification.content)
                .send().then(async response => {
                const status = !!response.accepted ? Status.COMPLETED : Status.FAILED

                await (new NotificationRepository).update({ status }, { id: notification.id })
                return { status: !!response.accepted ? Status.COMPLETED : Status.FAILED };
            }).catch(async err => log.error(err, err.message))
        });
    };
}
