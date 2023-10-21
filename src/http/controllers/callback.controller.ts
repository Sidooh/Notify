import Controller from './controller';
import { Request, Response } from 'express';
import { log } from '../../utils/logger';
import NotificationRepository from '../../repositories/notification.repository';
import { Notifiable, Notification } from '../../db/prisma';
import { Status } from '../../utils/enums';

export class CallbackController extends Controller {

    constructor(private repo = new NotificationRepository) {
        super('/callbacks');

        this.router.all(`${this.basePath}/wasiliana`, this.#wasiliana);
        this.router.all(`${this.basePath}/wavesms`, this.#wavesms);
        this.router.all(`${this.basePath}/websms`, this.#websms);
        this.router.all(`${this.basePath}/africastalking`, this.#africastalking);
    }

    #wasiliana = async ({ body }: Request, res: Response) => {
        log.info('...[CB]: WASILIANA...', { body });

        const notificationIds: bigint[] = body.correlator.split(',').map(id => Number(id));

        if (notificationIds.length > 0) {
            let status: Status = [1, 2].includes(Number(body.deliveryStatus))
                ? Status.COMPLETED : Status.FAILED;

            await Notification.updateMany({ where: { id: { in: notificationIds } }, data: { status: status } });

            let data: { status: Status, description?: string } = { status: status };

            if (body.failure_reason) data.description = body.failure_reason;

            await Notifiable.updateMany({
                where: {
                    notification_id: { in: notificationIds }, phone: { in: body.phone }
                }, data
            });
        }

        res.send();
    };

    #wavesms = ({ body }: Request, res: Response) => {
        log.info('...[CB]: WAVESMS...', { body });

        if (body.description == 'DeliveredToTerminal') {
            this.repo.handleCompleted(body.messageid);
        } else {
            this.repo.handleFailed(body.messageid);
        }

        res.send();
    };

    #websms = ({ body }: Request, res: Response) => {
        log.info('...[CB]: WEBSMS...', { body });

        if (body.code == 0) {
            this.repo.handleCompleted(body.message_id);
        } else {
            this.repo.handleFailed(body.message_id);
        }

        res.send();
    };

    #africastalking = ({ body }: Request, res: Response) => {
        log.info('...[CB]: AFRICASTALKING...', { body });

        if (body.status == 'Success') {
            this.repo.handleCompleted(body.id);
        } else {
            this.repo.handleFailed(body.id);
        }

        res.send();
    };
}
