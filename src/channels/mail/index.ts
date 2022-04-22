import MailService from './mail.service';
import NotificationInterface from '../../utils/interfaces/notification.interface';
import { log } from '../../utils/logger';
import { Notification } from '../../models/Notification';
import { Provider, Status } from '../../utils/enums';

export class Mail implements NotificationInterface {
    notifications
    #MailService

    constructor(notifications: Notification[]) {
        this.notifications = notifications
        this.#MailService = new MailService()
    }

    send = async () => {
        this.notifications.forEach(notification => {
            this.#MailService.from('sidooh@gmail.com')
                .to(notification.destination)
                .html(notification.content)
                .send().then(response => {
                return {status: !!response.accepted ? Status.COMPLETED : Status.FAILED}
            }).catch(error => {
                log.error(error, error.message);

                return {status: Status.FAILED}
            }).then(async ({status}) => {
                notification.status = status
                notification.provider = Provider.GMAIL
                await notification.save()

                return status === Status.COMPLETED
            })
        })
    }
}
