import { Request, Response, Router } from 'express';
import { BadRequestError } from '@nabz.tickets/common';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { Help } from '../../utils/helpers/helpers';
import ATService from '../../channels/sms/AT/AT.service';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';
import { Notification } from '../../models/notification.model';

export class DashboardController implements ControllerInterface {
    path: string = '/dashboard';
    router: Router = Router();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}/`, this.#dashboard);
    }

    #dashboard = async (req: Request, res: Response) => {
        const notifications = await Notification.find({})
            .select(['id', 'destination', 'channel', 'event_type', 'content', 'provider', 'status', 'created_at', 'notifiable_type'])
            .sort('-_id').limit(10).populate('notifiable_id', ['data']);
        const provider = await Help.getSetting('default_sms_provider');

        if (!provider) throw new BadRequestError('Default provider not set!');

        const balances = {
            websms: Number((await new WebSMSService().balance()).match(/-?\d+\.*\d*/g)[0]),
            africastalking: Number((await new ATService().balance()).match(/-?\d+\.*\d*/g)[0])
        };

        return res.send({ notifications, default_provider: provider, balances });
    };
}
