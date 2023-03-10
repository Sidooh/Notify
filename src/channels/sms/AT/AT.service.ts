import ServiceInterface from '../../../utils/interfaces/service.interface';
import { log } from '../../../utils/logger';
import { AfricasTalking } from './Lib/client';
import { ENV, Provider, Status } from '../../../utils/enums';
import { env } from '../../../utils/validate.env';
import prisma from '../../../db/prisma';
import { Notification } from '@prisma/client';
import { SMSNotificationResults } from '../../../utils/types';

const Notifiable = prisma.notifiable;

export enum ATApp {
    SMS = 'SMS',
    USSD = 'USSD'
}


export default class ATService implements ServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #AT;

    constructor(appEnv = env.NODE_ENV, product = ATApp.SMS) {
        let credentials = {
            apiKey  : String(env.AT_SMS_API_KEY),
            username: String(env.AT_SMS_USERNAME)
        };

        if (appEnv === ENV.DEVELOPMENT) {
            credentials = {
                apiKey  : String(env.AT_SMS_DEV_API_KEY),
                username: String(env.AT_SMS_DEV_USERNAME)
            };
        }

        if (product === ATApp.USSD) {
            credentials = {
                apiKey  : String(env.AT_USSD_API_KEY),
                username: String(env.AT_USSD_USERNAME)
            };
        }

        this.#AT = new AfricasTalking(credentials);
    }

    to = (to: string[]) => {
        this.#to = to.map(phone => `+${phone}`);

        return this;
    };

    message = (message: string) => {
        this.#message = message;

        return this;
    };

    balance = async (): Promise<number> => {
        const { balance } = await this.#AT.application();
        log.info('AT: BALANCE - ', { balance });

        return Number(Number(balance.match(/-?\d+\.*\d*/g)[0] / .8).toFixed(2));
    };

    send: (notifications: Notification[]) => Promise<SMSNotificationResults> = async (notifications: Notification[]) => {
        const options = {
            to     : this.#to,
            from   : env.NODE_ENV === 'production' ? String(env.AT_SMS_FROM) : undefined,
            message: this.#message
        };

        log.info('AT: SEND NOTIFICATION - ', options);

        return await this.#AT.send(options)
            .then(async (response: any) => {
                log.info('AT: RESPONSE - ', response);

                return await this.#save(notifications, response);
            }).catch((error: any) => {
                log.error(error);

                return { COMPLETED: [], FAILED: notifications.map(n => Number(n.id)) };
            });
    };

    #save = async (notifications: Notification[], callback: any): Promise<SMSNotificationResults> => {
        const results:SMSNotificationResults = { [Status.COMPLETED]: [], [Status.FAILED]: [] };

        const notifiables = notifications.map(notification => {
            let regex = /[+-]?\d+(\.\d+)?/g;

            const recipient = callback.SMSMessageData.Recipients.find(recipient => {
                return String(notification.destination).slice(-9) == String(recipient.number).slice(-9);
            });

            const status = recipient?.statusCode === 101 ? Status.COMPLETED : Status.FAILED;

            results[status].push(notification.id);

            return {
                notification_id: notification.id,
                message_id     : recipient?.messageId,
                phone          : recipient?.number,
                cost           : recipient?.cost.match(regex)[0],
                provider       : Provider.AT,
                description    : recipient?.status || callback.SMSMessageData.Message,
                status_code    : recipient?.statusCode,
                status
            };
        });

        await Notifiable.createMany({ data: notifiables });

        return results;
    };
}
