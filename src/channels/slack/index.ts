import NotificationInterface from '../../utils/interfaces/notification.interface';
import SlackService from './slack.service';
import { Notification } from '../../models/Notification';

export default class Slack implements NotificationInterface {
    notifications: Notification[];
    #SlackService;

    constructor(notifications: Notification[]) {
        this.notifications = notifications;
        this.#SlackService = new SlackService();
    }

    send = async () => {
        this.notifications.forEach(notification => {
            this.#SlackService.message(notification.content).send()
                .then(async ({ status }) => {
                    notification.status = status;

                    await notification.save();
                });
        });
    };
}
