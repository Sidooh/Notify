import MailService from './mail.service';
import NotificationInterface from '../../utils/interfaces/notification.interface';
import { log } from '../../utils/logger';
import { NotificationAttrs } from '../../../models/notification';

export class Mail implements NotificationInterface {
    notifications
    #MailService

    constructor(notifications: NotificationAttrs[]) {
        this.notifications = notifications
        this.#MailService = new MailService()
    }

    send = async () => {
        this.notifications.forEach(notification => {
            this.#MailService.from('sidooh@gmail.com')
                .to(notification.destination)
                .html(notification.content)
                .send().then(response => {
                return {status: !!response.accepted ? 'success' : 'failed'}
            }).catch(error => {
                log.error(error, error.message);

                return {status: 'failed'}
            }).then(async ({status}) => {
                notification.status = status
                notification.provider = 'GMAIL'
                await notification.save()

                return status === 'success'
            })
        })
    }
}
