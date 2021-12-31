import INotification from "@/resources/notification/notification.interface";
import NotificationInterface from "@/utils/interfaces/notification.interface";
import WebSMSService from "@/services/sms/WebSMS/WebSMS.service";
import ATService from "@/services/sms/AT/AT.service";

export default class SMS implements NotificationInterface {
    notification: INotification
    #SMSService

    constructor(notification: INotification) {
        this.notification = notification

        //TODO(Add logic to select service based on settings)
        this.#SMSService = new WebSMSService()
    }

    send = async () => {
        let destinations:string[] = this.notification.destination.map(phone => {
            return `+${phone.toString()}`
        })

        this.#SMSService.to(destinations).message(this.notification.content).send()
            .then(async ({status}) => {
                this.notification.status = status

                await this.notification.save()
            })
    }
}