import MailService from "@/services/mail/mail.service";
import log from "@/utils/logger";
import IMail from "@/services/mail/mail.interface";
import INotification from "@/resources/notification/notification.interface";
import NotificationInterface from "@/utils/interfaces/notification.interface";

export default class Mail implements NotificationInterface {
    notification: INotification
    #MailService

    constructor(notification: INotification) {
        this.notification = notification
        this.#MailService = new MailService()
    }

    send = async () => {
        this.#MailService.from('sidooh@gmail.com')
            .to(this.notification.destination)
            .html(this.notification.content)
            .send().then(response => {
            return {status: !!response.accepted ? 'success' : 'failed'}
        }).catch(error => {
            log.error(error, error.message);

            return {status: 'failed'}
        }).then(async ({status}) => {
            this.notification.status = status
            await this.notification.save()
        })
    }
}