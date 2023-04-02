import ServiceInterface from '../../../utils/interfaces/service.interface';
import { log } from '../../../utils/logger';
import { ENV, Provider, Status } from '../../../utils/enums';
import { Notification } from '@prisma/client';
import { env } from '../../../utils/validate.env';
import db from '../../../db/prisma';
import { WebSms, WebSmsConfig, WebSmsResponseData } from '@nabcellent/websms';
import { SMSNotificationResults } from '../../../utils/types';
import { SMS } from '../index';
import { Help } from '../../../utils/helpers';

const Notifiable = db.notifiable;

export default class WebSMSService implements ServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WebSMS: WebSms;

    constructor(appEnv = process.env.NODE_ENV) {
        let config: WebSmsConfig = {
            accessKey: env.WEBSMS_ACCESS_KEY,
            apiKey   : env.WEBSMS_API_KEY,
            clientId : env.WEBSMS_CLIENT_ID,
            senderId : env.WEBSMS_SENDER_ID
        };

        if (appEnv === ENV.DEVELOPMENT) {
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

    send: (notifications: Notification[]) => Promise<boolean> = async (notifications: Notification[]) => {
        log.info('WEBSMS: SEND NOTIFICATION - ', { message: this.#message, to: this.#to });

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
            return false;
        }
    };

    #save = async (notifications: Notification[], responses: WebSmsResponseData[]): Promise<boolean> => {
        log.info(`WEBSMS: Save Callback`);

        const results: SMSNotificationResults = { [Status.COMPLETED]: [], [Status.FAILED]: [] };

        const notifiables = notifications.map(notification => {
            const response = responses.find(res => {
                return String(notification.destination).slice(-9) == String(res.phone).slice(-9);
            });

            let status = response?.code === 0 ? Status.COMPLETED : Status.FAILED;

            results[status].push(notification.id);

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

        if(results.COMPLETED.length > 0) {
            await db.notification.updateMany({ where: { id: { in: results.COMPLETED } }, data: { status: Status.COMPLETED } })
        }
        if(results.FAILED.length > 0) {
            await db.notification.updateMany({ where: { id: { in: results.FAILED } }, data: { status: Status.FAILED } })

            new SMS(notifications, await Help.getSMSSettings()).retry(results.FAILED)
        }

        return true;
    };
}
