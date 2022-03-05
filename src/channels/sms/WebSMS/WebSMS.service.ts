import { Schema } from 'mongoose';
import { WebsmsCallback } from '../../../models/websms_callbacks.model';
import ServiceInterface from '../../../utils/interfaces/service.interface';
import { WebSms } from './Lib/client';
import { NotificationDoc } from '../../../models/notification.model';
import { WebSmsConfig } from './Lib/types';
import { log } from '../../../utils/logger';

export default class WebSMSService implements ServiceInterface {
    #message: string = '';
    #notification: NotificationDoc | undefined;
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

    notification = (notification: NotificationDoc) => {
        this.#notification = notification;

        return this;
    };

    send = async (): Promise<{ status: string, provider: string, notifiable_id: Schema.Types.ObjectId | null, notifiable_type: string }> => {
        log.info('WEBSMS: SEND NOTIFICATION - ', { message: this.#message, to: this.#to });

        const response = await this.#WebSMS.sms(this.#message).to(this.#to).send()
            .then(response => {
                log.info(`WEBSMS: RESPONSE`, response);

                if (response.ErrorCode !== 0) {
                    log.alert(response.ErrorDescription, response)

                    response = {
                        Data: [{
                            MessageErrorCode: response.ErrorCode,
                            MessageErrorDescription: response.ErrorDescription
                        }]
                    };
                }

                return { status: 'success', response: response };
            }).catch(error => {
                log.error(error);

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
                status: response.MessageErrorCode === 0 ? 'success' : 'failed'
            };
        });

        if (this.#notification) {
            const webSmsCallback = await WebsmsCallback.findById(this.#notification.notifiable_id);

            if (webSmsCallback) {
                const callback = webSmsCallback.data.map((obj: any) => callbacks.find((o: any) => o.phone === obj.phone) || obj);

                await WebsmsCallback.updateOne({ _id: this.#notification.notifiable_id }, { $set: { data: callback } }, { upsert: true });
                return { id: this.#notification.notifiable_id };
            }
        }

        return await WebsmsCallback.create({ data: callbacks });
    };
}
