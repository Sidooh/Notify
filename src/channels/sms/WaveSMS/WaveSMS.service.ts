import ServiceInterface from '../../../utils/interfaces/service.interface';
import { log } from '../../../utils/logger';
import { Provider, Status } from '../../../utils/enums';
import { Notification } from '@prisma/client';
import { env } from '../../../utils/validate.env';
import { WaveSMS, WaveSMSConfig, WaveSMSResponse } from '@nabcellent/wavesms';
import prisma from '../../../db/prisma';
import { SMSNotificationResults } from '../../../utils/types';

const Notifiable = prisma.notifiable;

export default class WaveSMSService implements ServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WaveSMS: WaveSMS;

    constructor() {
        let config: WaveSMSConfig = {
            apiKey   : env.WAVE_SMS_API_KEY,
            partnerId: env.WAVE_SMS_PARTNER_ID,
            senderId : env.WAVE_SMS_SENDER_ID
        };

        this.#WaveSMS = new WaveSMS(config);
    }

    to = (to: string[]) => {
        this.#to = to;

        return this;
    };

    message = (message: string) => {
        this.#message = message;

        return this;
    };

    balance = async () => {
        const balance = await this.#WaveSMS.balance.fetch();

        log.info('WAVESMS: BALANCE - ', { balance });

        return balance;
    };

    send: (notifications: Notification[]) => Promise<SMSNotificationResults> = async (notifications: Notification[]) => {
        log.info('WAVESMS: SEND NOTIFICATIONS - ', { notifications });

        const responses = await this.#WaveSMS.sms.text(this.#message).to(this.#to).send()
            .then(data => {
                log.info(`WAVESMS: RESPONSES`, data);

                return data
            }).catch(error => {
                log.error(error);

                return undefined
            });

        if (responses) {
            return await this.#save(notifications, responses);
        } else {
            return { COMPLETED: [], FAILED: notifications.map(n => n.id) };
        }
    };

    #save = async (notifications: Notification[], responses: WaveSMSResponse[]): Promise<SMSNotificationResults> => {
        log.info(`WAVESMS: Save Response`);

        const results:SMSNotificationResults = { [Status.COMPLETED]: [], [Status.FAILED]: [] };

        const notifiables = notifications.map(notification => {
            let response = responses.find(res => {
                return String(notification.destination).slice(-9) == String(res.mobile).slice(-9);
            });

            let status = response?.['response-code'] === 200 ? Status.COMPLETED : Status.FAILED;

            results[status].push(notification.id);

            return {
                notification_id: notification.id,
                message_id     : response?.message_id as string,
                phone          : String(response?.mobile),
                description    : response?.['response-description'],
                status_code    : response?.['response-code'],
                provider       : Provider.WAVESMS,
                status
            };
        });

        Notifiable.createMany({ data: notifiables });

        return results;
    };
}
