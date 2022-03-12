import { Request, Response, Router } from 'express';
import { BadRequestError } from '@nabz.tickets/common';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { Help } from '../../utils/helpers/helpers';
import ATService from '../../channels/sms/AT/AT.service';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';

export class SmsController implements ControllerInterface {
    path: string = '/sms';
    router: Router = Router();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}/balance`, this.#balance);
    }

    #balance = async (req: Request, res: Response) => {
        const provider = await Help.getSetting('default_sms_provider');

        if (!provider) throw new BadRequestError('Default provider not set!');

        let service;
        switch (provider) {
            case 'africastalking':
                service = new ATService();
                break;
            default:
                service = new WebSMSService();
        }

        const response = await service.balance();
        const balance = Number(response.match(/-?\d+\.*\d*/g)[0]);

        return res.send({ provider: provider.toUpperCase(), balance });
    };
}
