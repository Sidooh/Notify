import ISlack from './slack.interface';
import { NotificationDoc } from '../../models/notification.model';
import NotificationInterface from '../../utils/interfaces/notification.interface';
import SlackService from './slack.service';

export default class Slack implements NotificationInterface {
    notification
    #SlackService

    constructor(slack: ISlack, notification: NotificationDoc) {
        this.notification = notification
        this.#SlackService = new SlackService()
    }

    send = async () => {
        return this.#SlackService.message(this.notification.content).send()
            .then(async ({status}) => {
                this.notification.status = status
                this.notification.provider = 'SLACK'
                await this.notification.save()

                return status === 'success'
            })
    }
}
