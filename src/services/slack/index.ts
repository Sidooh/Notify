import SlackService from "@/services/slack/slack.service";
import ISlack from "@/services/slack/slack.interface";
import INotification from "@/resources/notification/notification.interface";

export default class Slack {
    notification: INotification
    data: ISlack
    #SlackService

    constructor(slack: ISlack, notification: INotification) {
        this.notification = notification
        this.data = slack
        this.#SlackService = new SlackService()
    }

    send = async () => {
        this.#SlackService.message(this.data.content).send()
            .then(async ({status}) => {
                this.notification.status = status
                await this.notification.save()
            })
    }
}