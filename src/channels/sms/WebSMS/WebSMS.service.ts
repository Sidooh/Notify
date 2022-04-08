import ServiceInterface from '../../../utils/interfaces/service.interface';
import { WebSms } from './Lib/client';
import { WebSmsConfig } from './Lib/types';
import { log } from '../../../utils/logger';
import db from '../../../../models';
import { WebsmsCallbackAttrs } from '../../../../models/websmscallback';

export default class WebSMSService implements ServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WebSMS;

    constructor(env = process.env.NODE_ENV) {
        console.log('jamaa');
        let config: WebSmsConfig = {
            accessKey: String(process.env.WEBSMS_ACCESS_KEY),
            apiKey   : String(process.env.WEBSMS_API_KEY),
            clientId : String(process.env.WEBSMS_CLIENT_ID),
            senderId : String(process.env.WEBSMS_SENDER_ID)
        };

        if (env === 'development') {
            config = {
                accessKey: String(process.env.WEBSMS_DEV_ACCESS_KEY),
                apiKey   : String(process.env.WEBSMS_DEV_API_KEY),
                clientId : String(process.env.WEBSMS_DEV_CLIENT_ID),
                senderId : String(process.env.WEBSMS_DEV_SENDER_ID)
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

        return response;
    };

    send = async (): Promise<{ status: string, provider: string, notifiable_type: string, notifiable_id?: number, phone?: string }[]> => {
        log.info('WEBSMS: SEND NOTIFICATION - ', { message: this.#message, to: this.#to });

        const response = await this.#WebSMS.sms(this.#message).to(this.#to).send()
            .then(response => {
                log.info(`WEBSMS: RESPONSE`, response);

                let status = 'success';
                if (response.ErrorCode !== 0) {
                    log.alert(response.ErrorDescription, response);

                    status = 'failed';
                    response = {
                        Data: [{
                            MessageErrorCode       : response.ErrorCode,
                            MessageErrorDescription: response.ErrorDescription
                        }]
                    };
                }

                return { status, response: response };
            }).catch(error => {
                log.error(error);

                return { status: 'failed', response: error };
            });

        const webSmsCallback = await this.#saveCallback(response);

        return webSmsCallback.map(cb => ({
            phone   : cb.phone, status: cb.status, notifiable_id: cb.id, notifiable_type: 'websms_callback',
            provider: 'WEBSMS'
        }));
    };

    #saveCallback = async (callback: any): Promise<WebsmsCallbackAttrs[]> => {
        return await db.WebsmsCallback.bulkCreate(callback.response.Data.map((response: any) => {
            return {
                message_id : response.MessageId,
                phone      : response.MobileNumber,
                description: response.MessageErrorDescription,
                status_code: response.MessageErrorCode,
                status     : response.MessageErrorCode === 0 ? 'success' : 'failed'
            };
        }));
    };
}
