import ServiceInterface from '../../../utils/interfaces/service.interface';
import { log } from '../../../utils/logger';
import { Provider, Status, Telco } from '../../../utils/enums';
import { Notification } from '@prisma/client';
import { env } from '../../../utils/validate.env';
import { WaveSMS, WaveSMSConfig, WaveSMSResponse } from '@nabcellent/wavesms';
import prisma from '../../../db/prisma';
import { getTelcoFromPhone } from '../../../utils/helpers';
import { SMSNotificationResults } from '../../../utils/types';

const Notifiable = prisma.notifiable;

export default class WaveSMSService implements ServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WaveSMS: WaveSMS;

    constructor() {
        let config: WaveSMSConfig = {
            apiKey   : env.WAVESMS_API_KEY,
            partnerId: env.WAVESMS_PARTNER_ID,
            senderId : env.WAVESMS_SENDER_ID
        };

        this.#WaveSMS = new WaveSMS(config);
    }

    to = (to: string[]) => {
        this.#to = to.filter(n => getTelcoFromPhone(n) === Telco.SAFARICOM);

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

                return data;
            }).catch(error => {
                log.error(error);

                return undefined;
            });

        if (responses) {
            const nonSafNotifications = notifications.filter(n => getTelcoFromPhone(n.destination) !== Telco.SAFARICOM);

            const res = await this.#save(notifications.filter(n => getTelcoFromPhone(n.destination) === Telco.SAFARICOM), responses)

            nonSafNotifications.map(n => res.FAILED?.push(n.id))

            return res;
        } else {

            return { FAILED: notifications.map(n => n.id) };
        }
    };

    #save = async (notifications: Notification[], responses: WaveSMSResponse[]): Promise<SMSNotificationResults> => {
        log.info(`WAVESMS: Save Response`);

        const results: SMSNotificationResults = { [Status.COMPLETED]: [], [Status.FAILED]: [] };

        const notifiables = notifications.map(notification => {
            let response = responses.find(res => {
                return String(notification.destination).slice(-9) == String(res.mobile).slice(-9);
            });

            if (response?.code === 1007) {
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

    query = async (messageId) => {
        return await this.#WaveSMS.sms.getDeliveryReport(messageId);
    };
}
