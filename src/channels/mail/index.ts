import Service from './service';
import NotificationInterface from '../../utils/interfaces/notification.interface';
import { log } from '../../utils/logger';
import { Notification } from '@prisma/client';
import { Status } from '../../utils/enums';
import NotificationRepository from '../../repositories/notification.repository';

export class Mail implements NotificationInterface {
    notifications: Notification[];
    service: Service;
    repo: NotificationRepository;

    constructor(notifications: Notification[]) {
        this.notifications = notifications;
        this.service = new Service;
        this.repo = new NotificationRepository;
    }

    send = async () => {
        this.service.from('sidooh@gmail.com')
            .to(this.notifications.map(n => n.destination))
            .html(this.notifications[0].content)
            .send().then(async response => {

            const COMPLETED: bigint[] = [], FAILED: bigint[] = [];

            response.accepted.forEach(e => {
                const id = this.notifications.find(n => n.destination === e)?.id;

                if (id) COMPLETED.push(id);
            });
            response.rejected.forEach(e => {
                const id = this.notifications.find(n => n.destination === e)?.id;

                if (id) FAILED.push(id);
            });

            if (COMPLETED.length > 0) {
                await this.repo.updateMany({ status: Status.COMPLETED }, { id: { in: COMPLETED } });
            }

            if (COMPLETED.length > 0) {
                await this.repo.updateMany({ status: Status.FAILED }, { id: { in: FAILED } });
            }
        }).catch(async err => log.error(err, err.message));
    };
}
