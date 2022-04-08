import ISlack from './slack.interface';
import NotificationInterface from '../../utils/interfaces/notification.interface';
import SlackService from './slack.service';
import { NotificationAttrs } from '../../../models/notification';

export default class Slack implements NotificationInterface {
    notifications
    #SlackService

    constructor(slack: ISlack, notifications: NotificationAttrs[]) {
        this.notifications = notifications
        this.#SlackService = new SlackService()
    }

    send = async () => {
        this.notifications.map(notification => {
            this.#SlackService.message(notification.content).send()
                .then(async ({status}) => {
                    notification.status = status
                    notification.provider = 'SLACK'

                    await notification.save()
                })
        })
    }
}
