import ServiceInterface from '../../../utils/interfaces/service.interface';
import { log } from '../../../utils/logger';
import { AfricasTalking } from './Lib/client';
import db from '../../../../models';
import { ATCallbackAttrs } from '../../../../models/atcallback';
import { Provider, Status } from '../../../utils/enums';
import { NotificationAttrs } from '../../../../models/notification';


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

    send: (notifications: NotificationAttrs[]) => Promise<string> = async (notifications: NotificationAttrs[]) => {
        const options = {
            to     : this.#to,
            from   : String(process.env.AT_SMS_FROM),
            message: this.#message
        };

        log.info('AT: SEND NOTIFICATION - ', options);

        return await this.#AT.send(options)
            .then(async (response: any) => {
                log.info('AT: RESPONSE - ', response);

                const atCallbacks = await this.#saveCallback(notifications, response.SMSMessageData);

                if(atCallbacks.every(cb => (cb.status === Status.COMPLETED))) return Status.COMPLETED

                log.error('AT CALLBACK SAVE ERROR: CALLBACKS - ', { atCallbacks })
                return Status.FAILED
            })
            .catch((error: any) => {
                log.error(error);

                return Status.FAILED;
            });
    };

    #saveCallback = async (notifications:NotificationAttrs[], callback: any): Promise<ATCallbackAttrs[]> => {
        return await db.ATCallback.bulkCreate(callback.Recipients.map((recipient: any) => {
            let regex = /[+-]?\d+(\.\d+)?/g;

            const notification = notifications.find(notification => {
                return String(notification.destination).slice(-9) == String(recipient.number).slice(-9);
            });

            if(notification) {
                const status = recipient.statusCode === 101 ? Status.COMPLETED : Status.FAILED

                notification.status = status
                notification.provider = Provider.AT;
                notification.save()

                return {
                    notification_id: notification.id,
                    message_id : recipient.messageId,
                    phone      : recipient.number,
                    cost       : parseFloat(recipient.cost.match(regex)[0]),
                    status     : status,
                    description: recipient.status,
                    status_code: recipient.statusCode
                };
            }
        }));
    };
}
