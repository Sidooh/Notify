import SlackService from "@/services/slack/slack.service";
import ISlack from "@/services/slack/slack.interface";
import INotification from "@/resources/notification/notification.interface";
import NotificationInterface from "@/utils/interfaces/notification.interface";

export default class Slack implements NotificationInterface {
    notification: INotification
    #SlackService

    constructor(slack: ISlack, notification: INotification) {
        this.notification = notification
        this.#SlackService = new SlackService()
    }

    send = async () => {
        this.#SlackService.message(this.notification.content).send()
            .then(async ({status}) => {
                this.notification.status = status
                await this.notification.save()
            })
    }
}