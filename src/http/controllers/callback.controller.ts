import Controller from './controller';
import { Request, Response } from 'express';
import { log } from '../../utils/logger';
import NotificationRepository from '../../repositories/notification.repository';
import { Notifiable, Notification, Setting } from '../../db/prisma';
import { SettingKey, Status } from '../../utils/enums';

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

        await Setting.upsert({
            where : { key: SettingKey.WASILIANA_SMS_BALANCE },
            update: { value: String(body.unit_balance) },
            create: { key: SettingKey.WASILIANA_SMS_BALANCE, value: String(body.unit_balance) }
        })

        let status: Status = [1, 2].includes(Number(body.deliveryStatus))
            ? Status.COMPLETED : Status.FAILED;

        const notificationIds: bigint[] = body.message_uid.split(',').map(id => Number(id));

        await Notification.updateMany({ where: { id: { in: notificationIds } }, data: { status } });

        let data: { status: Status, description?: string } = { status: status };

        if (body.failure_reason) data.description = body.failure_reason;

        await Notifiable.updateMany({ where: { notification_id: { in: notificationIds } }, data });

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
