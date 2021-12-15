import MailService from "@/services/mail/mail.service";
import log from "@/utils/logger";
import IMail from "@/services/mail/mail.interface";
import INotification from "@/resources/notification/notification.interface";
import NotificationInterface from "@/utils/interfaces/notification.interface";

export default class Mail implements NotificationInterface {
    notification: INotification
    data: IMail
    #MailService

    constructor(mail: IMail, notification: INotification) {
        this.notification = notification
        this.data = mail
        this.#MailService = new MailService()
    }

    send = async () => {
        this.#MailService.from('sidooh@gmail.com')
            .to(this.data.destination)
            .html(this.data.content)
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