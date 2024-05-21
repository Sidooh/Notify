import { log } from '../../../utils/logger';
import { Provider, Telco } from '../../../utils/enums';
import { Notification } from '@prisma/client';
import { env } from '../../../utils/validate.env';
import { Wasiliana, WasilianaConfig, WasilianaResponse } from '@nabcellent/wasiliana';
import prisma from '../../../db/prisma';
import { getTelcoFromPhone, partition } from '../../../utils/helpers';
import { SMSNotificationResults } from '../../../utils/types';
import SmsServiceInterface from '../../../utils/interfaces/sms-service.interface';

const Notifiable = prisma.notifiable;

export default class WasilianaService implements SmsServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #wasiliana: Wasiliana;

    constructor(appEnv = env.WASILIANA_SANDBOX) {
        let config: WasilianaConfig = {
            apiKey  : env.WASILIANA_API_KEY,
            senderId: env.WASILIANA_SENDER_ID
        };

        /*if (appEnv === ENV.DEVELOPMENT) {
            throw new Error('Wasiliana development config not set!');
        }*/

        this.#wasiliana = new Wasiliana(config);
    }

    to = (to: string[]) => {
        this.#to = to;

        return this;
    };

    message = (message: string) => {
        this.#message = message;

        return this;
    };

    send: (notifications: Notification[]) => Promise<SMSNotificationResults> = async (notifications: Notification[]) => {
        //  TODO: Remove once we get airtel & telkom.
        this.#to = this.#to.filter(n => getTelcoFromPhone(n) === Telco.SAFARICOM);

        const notificationIds = notifications.map(n => n.id);
        const responses = await this.#wasiliana.sms.text(this.#message).to(this.#to)
            .messageId(notificationIds.join()).send()
            .then(data => {
                log.info(`[SRV WASILIANA]: RES`, data);

                return data;
            }).catch(error => {
                log.error(error);

                return undefined;
            });

        if (responses) {
            //  TODO: Remove once we get airtel & telkom.
            const [saf, nonSaf] = partition(notifications, n => getTelcoFromPhone(n.destination) === Telco.SAFARICOM);

            const res = await this.#save(saf, responses);

            nonSaf.map(n => res.FAILED?.push(n.id));

            return res;
        } else {
            return { FAILED: notifications.map(n => n.id) };
        }
    };

    #save = async (notifications: Notification[], responses: WasilianaResponse[]): Promise<SMSNotificationResults> => {
        const results: SMSNotificationResults = { REQUESTED: [], FAILED: [] };

        const notifiables = notifications.map(notification => {
            let response = responses.find(res => {
                return notification.destination.slice(-9) == String(res.phone).slice(-9);
            });

            results[response?.status === 'success' ? 'REQUESTED' : 'FAILED']?.push(notification.id);

            return {
                notification_id: notification.id,
                phone          : String(response?.phone),
                description    : response?.description,
                cost           : response?.cost,
                provider       : Provider.WASILIANA
            };
        });

        await Notifiable.createMany({ data: notifiables });

        return results;
    };
}
