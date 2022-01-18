import NotificationInterface from "@/utils/interfaces/notification.interface";
import WebSMSService from "@/services/sms/WebSMS/WebSMS.service";
import {INotification} from "@/models/interfaces";
import ATService from "@/services/sms/AT/AT.service";

export default class SMS implements NotificationInterface {
    notification: INotification
    #SMSService

    constructor(notification: INotification, provider: string|undefined) {
        this.notification = notification

        //TODO(Add better logic to select service based on settings)
        switch (provider) {
            case 'africastalking':
                this.#SMSService = new ATService()
                break;
            default:
                this.#SMSService = new WebSMSService()
        }
    }

    send = async () => {
        this.#SMSService.to(this.notification.destination).message(this.notification.content).send()
            .then(async ({status, provider}) => {
                this.notification.status = status
                this.notification.provider = provider

                await this.notification.save()
            })
    }
}
