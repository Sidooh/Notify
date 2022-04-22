import { Request, Response, Router } from 'express';
import { BadRequestError } from '@nabz.tickets/common';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { Help } from '../../utils/helpers';
import ATService from '../../channels/sms/AT/AT.service';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';

export class SmsController implements ControllerInterface {
    path: string = '/sms';
    router: Router = Router();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}/balances`, this.#balance);
    }

    #balance = async (req: Request, res: Response) => {
        const provider = await Help.getSettings('default_sms_provider');

        if (!provider) throw new BadRequestError('Default provider not set!');

        const balances = {
            websms        : Number((await new WebSMSService().balance()).match(/-?\d+\.*\d*/g)[0]),
            africastalking: Number((await new ATService().balance()).match(/-?\d+\.*\d*/g)[0])
        };

        return res.send({ default_provider: provider, balances });
    };
}
