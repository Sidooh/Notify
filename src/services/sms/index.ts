import ISlack from "@/services/slack/slack.interface";
import INotification from "@/resources/notification/notification.interface";
import NotificationInterface from "@/utils/interfaces/notification.interface";
import ATService from "@/services/sms/AT/AT.service";

export default class SMS implements NotificationInterface {
    notification: INotification
    #ATService

    constructor(notification: INotification) {
        this.notification = notification
        this.#ATService = new ATService()
    }

    send = async () => {
        let destinations:string[] = this.notification.destination.map(phone => {
            return `+${phone.toString()}`
        })

        this.#ATService.to(destinations).message(this.notification.content).send()
            .then(async ({status}) => {
                this.notification.status = status
                await this.notification.save()
            })
    }
}