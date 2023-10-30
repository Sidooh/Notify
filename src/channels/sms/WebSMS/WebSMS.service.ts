import { log } from '../../../utils/logger';
import { ENV, Provider, Status } from '../../../utils/enums';
import { Notification } from '@prisma/client';
import { env } from '../../../utils/validate.env';
import db from '../../../db/prisma';
import { WebSms, WebSmsConfig, WebSmsResponseData } from '@nabcellent/websms';
import { SMSNotificationResults } from '../../../utils/types';
import SmsServiceInterface from '../../../utils/interfaces/sms-service.interface';

const Notifiable = db.notifiable;

export default class WebSMSService implements SmsServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WebSMS: WebSms;

    constructor(appEnv = env.WEBSMS_SANDBOX) {
        let config: WebSmsConfig = {
            accessKey: env.WEBSMS_ACCESS_KEY,
            apiKey   : env.WEBSMS_API_KEY,
            clientId : env.WEBSMS_CLIENT_ID,
            senderId : env.WEBSMS_SENDER_ID
        };

        if (appEnv === ENV.DEVELOPMENT && env.WEBSMS_DEV_API_KEY) {
            config = {
                accessKey: env.WEBSMS_DEV_ACCESS_KEY,
                apiKey   : env.WEBSMS_DEV_API_KEY,
                clientId : env.WEBSMS_DEV_CLIENT_ID,
                senderId : env.WEBSMS_DEV_SENDER_ID
            };
        }

        this.#WebSMS = new WebSms(config);
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
        const balance = await this.#WebSMS.balance.fetch();

        log.info('WEBSMS: BALANCE - ', { balance });

        return balance;
    };

    send: (notifications: Notification[]) => Promise<SMSNotificationResults> = async (notifications: Notification[]) => {
        const responses = await this.#WebSMS.sms.text(this.#message).to(this.#to).send()
            .then(response => {
                log.info(`WEBSMS: RESPONSE`, response);

                if (response.code !== 0) {
                    response = {
                        ...response,
                        data: [{
                            code       : response.code,
                            description: String(response.description),
                            cost       : 0
                        }]
                    };
                }

                return response.data;
            }).catch(error => {
                log.error(error);

                return undefined;
            });

        if (responses) {
            return await this.#save(notifications, responses);
        } else {
            return { FAILED: notifications.map(n => n.id) };
        }
    };

    #save = async (notifications: Notification[], responses: WebSmsResponseData[]): Promise<SMSNotificationResults> => {
        const results: SMSNotificationResults = { [Status.COMPLETED]: [], [Status.FAILED]: [] };

        const notifiables = notifications.map(notification => {
            const response = responses.find(res => {
                return notification.destination.slice(-9) == String(res.phone).slice(-9);
            });

            let status = response?.code === 0 ? Status.COMPLETED : Status.FAILED;

            results[status]!.push(notification.id);

            return {
                notification_id: notification.id,
                message_id     : response?.message_id,
                phone          : response?.phone,
                description    : response?.description,
                status_code    : response?.code,
                cost           : response?.cost,
                provider       : Provider.WEBSMS,
                status
            };
        });

        await Notifiable.createMany({ data: notifiables });

        return results;
    };
}
