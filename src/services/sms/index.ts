import ISlack from "@/services/slack/slack.interface";
import INotification from "@/resources/notification/notification.interface";
import NotificationInterface from "@/utils/interfaces/notification.interface";
import ATService from "@/services/sms/AT/AT.service";

export default class SMS implements NotificationInterface {
    notification: INotification
    data: ISlack
    #ATService

    constructor(slack: ISlack, notification: INotification) {
        this.notification = notification
        this.data = slack
        this.#ATService = new ATService()
    }

    send = async () => {
        this.#ATService.to([+254110039317]).message(this.data.content).send()
            .then(async ({status}) => {
                this.notification.status = status
                await this.notification.save()
            })
    }
}