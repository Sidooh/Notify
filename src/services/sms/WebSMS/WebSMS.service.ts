import log from '@/utils/logger';
import ServiceInterface from '@/utils/interfaces/service.interface';
import { WebSmsConfig } from '@/services/sms/WebSMS/Lib/types';
import { WebSms } from '@/services/sms/WebSMS/Lib/client';
import { WebsmsCallback } from '@/models/websms_callbacks.model';
import { Schema } from 'mongoose';

export default class WebSMSService implements ServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WebSMS;

    constructor() {
        const config: WebSmsConfig = {
            accessKey: String(process.env.WEBSMS_ACCESS_KEY),
            apiKey: String(process.env.WEBSMS_API_KEY),
            clientId: String(process.env.WEBSMS_CLIENT_ID),
            senderId: String(process.env.WEBSMS_SENDER_ID)
        };

        this.#WebSMS = new WebSms(config, 'sandbox');
    }

    to = (to: string[]) => {
        this.#to = to;

        return this;
    };

    message = (message: string) => {
        this.#message = message;

        return this;
    };

    send = async (): Promise<{ status: string, provider: string, notifiable_id: Schema.Types.ObjectId | null, notifiable_type: string }> => {
        const response = await this.#WebSMS.sms(this.#message).to(this.#to).send()
            .then(response => {
                if (response.ErrorCode !== 0) {
                    response = {
                        Data: [{
                            MessageErrorCode: response.ErrorCode,
                            MessageErrorDescription: response.ErrorDescription
                        }]
                    };
                }

                return { status: 'success', response: response };
            }).catch(error => {
                log.error(error, error.message);

                return { status: 'failed', response: error };
            });

        const webSmsCallback = await this.#saveCallback(response);
        return {
            ...response,
            provider: 'WEBSMS',
            notifiable_type: 'WebsmsCallback',
            notifiable_id: webSmsCallback.id
        };
    };

    #saveCallback = async (callback: any) => {
        const callbacks = callback.response.Data.map((response: any) => {
            return {
                message_id: response.MessageId,
                phone: response.MobileNumber,
                description: response.MessageErrorDescription,
                status_code: response.MessageErrorCode,
                status: callback.status
            };
        });

        return await WebsmsCallback.create({ data: callbacks });
    };
}
