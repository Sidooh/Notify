import INotification from "@/resources/notification/notification.interface";
import MailService from "@/services/mail/mail.service";

export default class Mail {
    notification: INotification
    #mail

    constructor(notification:INotification) {
        this.notification = notification
        this.#mail = new MailService()
    }

    send = async () => {
        this.#mail.from('Sidooh').to(this.notification.to).message(this.notification.content).send()
        console.log(this.notification)
    }
}