import SlackService from '@/channels/slack/slack.service';
import ISlack from '@/channels/slack/slack.interface';
import NotificationInterface from '@/utils/interfaces/notification.interface';
import { NotificationDoc } from '@/models/notification.model';

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
