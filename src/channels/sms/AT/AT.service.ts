import ServiceInterface from '../../../utils/interfaces/service.interface';
import { log } from '../../../utils/logger';
import { AfricasTalking } from './Lib/client';
import { Provider, Status } from '../../../utils/enums';
import { ATCallback } from '../../../models/ATCallback';
import { Notification } from '../../../models/Notification';


export default class ATService implements ServiceInterface {
    #message: string = '';
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

    balance = async () => {
        const { balance } = await this.#AT.application();
        log.info('AT: BALANCE - ', { balance });

        return balance;
    };

    send: (notifications: Notification[]) => Promise<string> = async (notifications: Notification[]) => {
        const options = {
            to     : this.#to,
            from   : process.env.NODE_ENV === 'production' ? String(process.env.AT_SMS_FROM) : undefined,
            message: this.#message
        };

        log.info('AT: SEND NOTIFICATION - ', options);

        return await this.#AT.send(options)
            .then(async (response: any) => {
                log.info('AT: RESPONSE - ', response);

                const atCallbacks = await this.#saveCallback(notifications, response);

                if (atCallbacks.every(cb => (cb.status === Status.COMPLETED))) return Status.COMPLETED;

                log.error('AT CALLBACK SAVE ERROR: CALLBACKS - ', { atCallbacks });
                return Status.FAILED;
            })
            .catch((error: any) => {
                log.error(error);

                return Status.FAILED;
            });
    };

    #saveCallback = async (notifications: Notification[], callback: any): Promise<ATCallback[]> => {
        const callbacks = ATCallback.create(notifications.map(notification => {
            let regex = /[+-]?\d+(\.\d+)?/g;

            const recipient = callback.SMSMessageData.Recipients.find(recipient => {
                return String(notification.destination).slice(-9) == String(recipient.number).slice(-9);
            });

            const status = recipient?.statusCode === 101 ? Status.COMPLETED : Status.FAILED;

            notification.status = status;
            notification.provider = Provider.AT;
            notification.save();

            return {
                notification_id: notification.id,
                message_id     : recipient?.messageId,
                phone          : recipient?.number,
                cost           : recipient?.cost.match(regex)[0],
                status,
                description    : recipient?.status || callback.SMSMessageData.Message,
                status_code    : recipient?.statusCode
            };
        }));

        return await ATCallback.save(callbacks);
    };
}
