import ServiceInterface from '../../../utils/interfaces/service.interface';
import { WebSms } from './Lib/client';
import { WebSmsConfig } from './Lib/types';
import { log } from '../../../utils/logger';
import { ENV, Provider, Status } from '../../../utils/enums';
import { Notification } from '@prisma/client';
import { env } from '../../../utils/validate.env';
import prisma from '../../../db/prisma';
import { SMSNotificationResults } from '../../../utils/types';

const Notifiable = prisma.notifiable;

export default class WebSMSService implements ServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WebSMS;

    constructor(appEnv = env.NODE_ENV) {
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
        const response = await this.#WebSMS.balance();

        log.info('WEBSMS: BALANCE - ', { balance: response });

        return Number((Number((response).slice(3))).toFixed(2));
    };

    send: (notifications: Notification[]) => Promise<SMSNotificationResults> = async (notifications: Notification[]) => {
        log.info('WEBSMS: SEND NOTIFICATION - ', { message: this.#message, to: this.#to });

        const { status, responses } = await this.#WebSMS.sms(this.#message).to(this.#to).send()
            .then(response => {
                log.info(`WEBSMS: RESPONSE`, response);

                let status = true;
                if (response.ErrorCode !== 0) {
                    log.alert(response.ErrorDescription, response);

                    status = false;
                    response = {
                        Data: [{
                            MessageErrorCode       : response.ErrorCode,
                            MessageErrorDescription: response.ErrorDescription
                        }]
                    };
                }

                return { status, responses: response.Data };
            }).catch(error => {
                log.error(error);

                return { status: false };
            });

        if (status) {
            return await this.#save(notifications, responses);
        } else {
            return { COMPLETED: [], FAILED: notifications.map(n => n.id) };
        }
    };

    #save = async (notifications: Notification[], responses: any): Promise<SMSNotificationResults> => {
        log.info(`WEBSMS: Save Callback`);

        const results: SMSNotificationResults = { [Status.COMPLETED]: [], [Status.FAILED]: [] };

        const notifiables = notifications.map(notification => {
            const response = responses.find(res => {
                return String(notification.destination).slice(-9) == String(res.MobileNumber).slice(-9);
            });

            let status = response?.MessageErrorCode === 0 ? Status.COMPLETED : Status.FAILED;

            results[status].push(notification.id);

            return {
                notification_id: notification.id,
                message_id     : response?.MessageId,
                phone          : response?.MobileNumber,
                description    : response?.MessageErrorDescription || responses[0].MessageErrorDescription,
                status_code    : response?.MessageErrorCode || responses[0].MessageErrorCode,
                provider       : Provider.WEBSMS,
                status
            };
        });

        await Notifiable.createMany({ data: notifiables });

        return results;
    };
}
