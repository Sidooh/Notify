import MailService from '@/channels/mail/mail.service';
import { log } from '@/utils/logger';
import NotificationInterface from '@/utils/interfaces/notification.interface';
import { NotificationDoc } from '@/models/notification.model';

export default class Mail implements NotificationInterface {
    notification
    #MailService

    constructor(notification: NotificationDoc) {
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
            this.notification.provider = 'GMAIL'
            await this.notification.save()

            return status === 'success'
        })
    }
}
