import NotificationInterface from '../../utils/interfaces/notification.interface';
import SlackService from './slack.service';
import { Notification } from '../../models/Notification';
import { Provider } from '../../utils/enums';

export default class Slack implements NotificationInterface {
    notifications
    #SlackService

    constructor(notifications: Notification[]) {
        this.notifications = notifications
        this.#SlackService = new SlackService()
    }

    send = async () => {
        this.notifications.map(notification => {
            this.#SlackService.message(notification.content).send()
                .then(async ({status}) => {
                    notification.status = status
                    notification.provider = Provider.SLACK

                    await notification.save()
                })
        })
    }
}
