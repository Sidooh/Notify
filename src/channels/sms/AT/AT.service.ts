import ServiceInterface from '../../../utils/interfaces/service.interface';
import { log } from '../../../utils/logger';
import { AfricasTalking } from './Lib/client';
import db from '../../../../models';
import { ATCallbackAttrs } from '../../../../models/atcallback';
import { Status } from '../../../utils/enums';


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

    send = async (): Promise<{ status: string, provider: string, notifiable_type: string, notifiable_id?: number, phone?: string }[]> => {
        const options = {
            to     : this.#to,
            from   : String(process.env.AT_SMS_FROM),
            message: this.#message
        };

        log.info('AT: SEND NOTIFICATION - ', options);

        const response = await this.#AT.send(options)
            .then(async (response: any) => {
                log.info('AT: RESPONSE - ', response);

                const atCallbacks = await this.#saveCallback(response.SMSMessageData);

                return atCallbacks.map(callback => ({
                    phone: callback.phone, status: callback.status, notifiable_id: callback.id
                }));
            })
            .catch((error: any) => {
                log.error(error);

                return [{ status: Status.FAILED }];
            });

        return response.map(res => ({ ...res, notifiable_type: 'at_callback', provider: 'AFRICASTALKING' }));
    };

    #saveCallback = async (callback: any): Promise<ATCallbackAttrs[]> => {
        return await db.ATCallback.bulkCreate(callback.Recipients.map((recipient: any) => {
            let regex = /[+-]?\d+(\.\d+)?/g;

            return {
                message_id : recipient.messageId,
                phone      : recipient.number,
                cost       : parseFloat(recipient.cost.match(regex)[0]),
                status     : recipient.statusCode === 101 ? Status.COMPLETED : Status.FAILED,
                description: recipient.status,
                status_code: recipient.statusCode
            };
        }));
    };
}
