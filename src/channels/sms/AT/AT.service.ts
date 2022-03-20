import { Schema } from 'mongoose';
import ServiceInterface from '../../../utils/interfaces/service.interface';
import { ATCallback } from '../../../models/at_callbacks.model';
import { NotificationDoc } from '../../../models/notification.model';
import { log } from '../../../utils/logger';
import { AfricasTalking } from './Lib/client';


export default class ATService implements ServiceInterface {
    #message: string = '';
    #notification: NotificationDoc | undefined;
    #to: string[] = [];
    #AT;

    constructor(env = process.env.NODE_ENV) {
        let credentials = {
            apiKey  : String(process.env.AT_SMS_API_KEY),
            username: String(process.env.AT_SMS_USERNAME)
        };

        if (env === 'development') {
            credentials = {
                apiKey  : String(process.env.AT_SMS_DEV_API_KEY),
                username: String(process.env.AT_SMS_DEV_USERNAME)
            };
        }

        this.#AT = new AfricasTalking(credentials);
    }

    to = (to: string[]) => {
        this.#to = to.map(phone => {
            phone = phone.toString();
            return `+254${(phone.length > 9 ? phone.slice(-9) : phone)}`;
        });

        return this;
    };

    message = (message: string) => {
        this.#message = message;

        return this;
    };

    notification = (notification: NotificationDoc) => {
        this.#notification = notification;

        return this;
    };

    balance = async () => {
        const { balance } = await this.#AT.application();
        log.info('AT: BALANCE - ', { balance });

        return balance;
    };

    send = async (): Promise<{ status: string, provider: string, notifiable_id: Schema.Types.ObjectId | null, notifiable_type: string }> => {
        const options = {
            to     : this.#to,
            from   : String(process.env.AT_SMS_FROM),
            message: this.#message
        };

        log.info('AT: SEND NOTIFICATION - ', options);

        const response = await this.#AT.send(options)
            .then(async (response: any) => {
                log.info('AT: RESPONSE - ', response);

                // const hasError = response.SMSMessageData.Recipients.some((recipient: any) => recipient.statusCode !== 101);
                const atCallback = await this.#saveCallback(response.SMSMessageData);

                return { status: 'success', notifiable_id: atCallback.id };
            })
            .catch((error: any) => {
                log.error(error);

                return { status: 'failed', notifiable_id: null };
            });

        return { ...response, notifiable_type: 'ATCallback', provider: 'AFRICASTALKING' };
    };

    #saveCallback = async (callback: any) => {
        const callbacks = callback.Recipients.map((recipient: any) => {
            let regex = /[+-]?\d+(\.\d+)?/g;

            return {
                message_id : recipient.messageId,
                phone      : recipient.number,
                cost       : parseFloat(recipient.cost.match(regex)[0]),
                status     : recipient.statusCode === 101 ? 'success' : 'failed',
                description: recipient.status,
                status_code: recipient.statusCode
            };
        });

        if (this.#notification?.notifiable_id) {
            const atCallback = await ATCallback.findById(this.#notification.notifiable_id);

            if (atCallback) {
                const callback = atCallback.data.map((obj: any) => callbacks.find((o: any) => o.phone === obj.phone) || obj);

                await ATCallback.updateOne({ _id: this.#notification.notifiable_id }, { $set: { data: callback } }, { upsert: true });
                return { id: this.#notification.notifiable_id };
            }
        }

        return await ATCallback.create({ data: callbacks });
    };
}
