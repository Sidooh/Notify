import NotificationInterface from '../../utils/interfaces/notification.interface';
import SlackService from './slack.service';
import { Notification } from '@prisma/client';
import NotificationRepository from '../../repositories/notification.repository';

export default class Slack implements NotificationInterface {
    notifications;
    service;

    constructor(notifications: Notification[]) {
        this.notifications = notifications;

        this.service = new SlackService();
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
