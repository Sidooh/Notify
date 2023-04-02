import NotificationInterface from '../../utils/interfaces/notification.interface';
import { Service } from './service';
import { Notification } from '@prisma/client';
import NotificationRepository from '../../repositories/notification.repository';

export class Slack implements NotificationInterface {
    notifications: Notification[];
    service: Service;

    constructor(notifications: Notification[]) {
        this.notifications = notifications;

        this.service = new Service;
    }

    send = async () => {
        this.notifications.map(notification => {
            this.service.message(notification.content).send()
                .then(async ({ status }) => {
                    await (new NotificationRepository).update({ status }, { id: notification.id });
                });
        });
    };
}
