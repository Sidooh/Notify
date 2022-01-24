import SlackService from '@/services/slack/slack.service';
import ISlack from '@/services/slack/slack.interface';
import NotificationInterface from '@/utils/interfaces/notification.interface';
import { INotification } from '@/models/interfaces';

export default class Slack implements NotificationInterface {
    notification: INotification
    #SlackService

    constructor(slack: ISlack, notification: INotification) {
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
