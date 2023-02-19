import Controller from './controller';
import { Request, Response } from 'express';
import { env } from '../../utils/validate.env';
import { Help } from '../../utils/helpers';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';
import NotificationRepository from '../../repositories/notification.repository';
import { Channel, EventType, Status } from '../../utils/enums';
import ATService, { ATApp } from '../../channels/sms/AT/AT.service';
import WaveSMSService from '../../channels/sms/WaveSMS/WaveSMS.service';

export class JobController extends Controller {
    constructor() {
        super('/jobs');
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.post(`${this.basePath}/providers/check-balances`, this.#checkServiceBalances);
    }

    #checkServiceBalances = async (req: Request, res: Response) => {
        if (!env.SP_BALANCE_NOTIFICATION_ENABLED) return res.send({});

        const smsSettings = await Help.getSMSSettings();
        const websms = await new WebSMSService(smsSettings.websms_env).balance();
        const wavesms = await new WaveSMSService().balance();
        const africasTalking = {
            sms : await new ATService(smsSettings.africastalking_env).balance(),
            ussd: await new ATService(smsSettings.africastalking_env, ATApp.USSD).balance()
        };

        let message = `Provider Balances:\n`;

        const wavesmsIsBelowThresh = wavesms <= env.WAVESMS_THRESHOLD;
        const websmsIsBelowThresh = websms <= env.WEBSMS_THRESHOLD;
        const ATAirtimeIsBelowBelowThresh = africasTalking.sms <= env.AT_SMS_THRESHOLD;
        const ATUSSDIsBelowThresh = africasTalking.ussd <= env.AT_USSD_THRESHOLD;

        if (wavesmsIsBelowThresh || websmsIsBelowThresh || ATAirtimeIsBelowBelowThresh || ATUSSDIsBelowThresh) {
            message += `\t - WaveSMS: ${wavesms}\n
                        \t - WebSMS: ${websms}\n
                        \t - AT SMS: ${africasTalking.sms}\n
                        \t - AT USSD: ${africasTalking.ussd}\n`;
        }

        if (message.includes('-')) {
            message += `\n#SRV:Notify`;

            await NotificationRepository.notify(Channel.SMS, message, EventType.STATUS_UPDATE, env.ADMIN_CONTACTS.split(','));
        }

        return res.send(this.successResponse({ data: Status.COMPLETED }));
    };
}