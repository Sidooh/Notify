import { log } from '../../../utils/logger';
import { ENV, Provider, Telco } from '../../../utils/enums';
import { Notification } from '@prisma/client';
import { env } from '../../../utils/validate.env';
import { WaveSMS, WaveSMSConfig, WaveSMSResponse } from '@nabcellent/wavesms';
import prisma from '../../../db/prisma';
import { getTelcoFromPhone } from '../../../utils/helpers';
import { SMSNotificationResults } from '../../../utils/types';
import SmsServiceInterface from '../../../utils/interfaces/sms-service.interface';

const Notifiable = prisma.notifiable;

export default class WaveSMSService implements SmsServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WaveSMS: WaveSMS;

    constructor(appEnv = env.WAVESMS_SANDBOX) {
        let config: WaveSMSConfig = {
            apiKey   : env.WAVESMS_API_KEY,
            partnerId: env.WAVESMS_PARTNER_ID,
            senderId : env.WAVESMS_SENDER_ID
        };

        if (appEnv === ENV.DEVELOPMENT) {
            config.senderId = env.WAVESMS_DEV_SENDER_ID;
        }

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

        log.info('[SRV WAVESMS]: Balance - ', { balance });

        return balance;
    };

    send: (notifications: Notification[]) => Promise<SMSNotificationResults> = async (notifications: Notification[]) => {
        //  TODO: Remove once we get airtel on WAVE.
        this.#to = this.#to.filter(n => getTelcoFromPhone(n) !== Telco.AIRTEL);

        const responses = await this.#WaveSMS.sms.text(this.#message).to(this.#to).send()
            .then(data => {
                log.info(`[SRV WAVESMS]: Responses`, data);

                return data;
            }).catch(error => {
                log.error(error);

                return undefined;
            });

        if (responses) {
            //  TODO: Remove once we get airtel on WAVE.
            const airtelNotifications = notifications.filter(n => getTelcoFromPhone(n.destination) === Telco.AIRTEL);

            const res = await this.#save(notifications.filter(n => getTelcoFromPhone(n.destination) !== Telco.AIRTEL), responses);

            airtelNotifications.map(n => res.FAILED?.push(n.id));

            return res;
        } else {
            return { FAILED: notifications.map(n => n.id) };
        }
    };

    #save = async (notifications: Notification[], responses: WaveSMSResponse[]): Promise<SMSNotificationResults> => {
        const results: SMSNotificationResults = { REQUESTED: [], FAILED: [] };

        const notifiables = notifications.map(notification => {
            let response = responses.find(res => {
                return notification.destination.slice(-9) == String(res.mobile).slice(-9);
            });

            if (!response?.code || [1007, 1004].includes(response?.code)) {
                results.FAILED?.push(notification.id);
            } else if (response?.code === 200) {
                results.REQUESTED?.push(notification.id);
            }

            return {
                notification_id: notification.id,
                message_id     : response?.message_id as string,
                phone          : String(response?.mobile),
                description    : response?.description,
                status_code    : response?.code,
                cost           : response?.cost,
                provider       : Provider.WAVESMS
            };
        });

        await Notifiable.createMany({ data: notifiables });

        return results;
    };

    query = async (messageId: string | number) => {
        return await this.#WaveSMS.sms.getDeliveryReport(messageId);
    };
}
