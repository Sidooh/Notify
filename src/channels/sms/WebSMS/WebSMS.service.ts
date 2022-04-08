import ServiceInterface from '../../../utils/interfaces/service.interface';
import { WebSms } from './Lib/client';
import { WebSmsConfig } from './Lib/types';
import { log } from '../../../utils/logger';
import db from '../../../../models';
import { WebsmsCallbackAttrs } from '../../../../models/websmscallback';
import { NotificationAttrs } from '../../../../models/notification';
import { Provider, Status } from '../../../utils/enums';

export default class WebSMSService implements ServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WebSMS;

    constructor(env = process.env.NODE_ENV) {
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

    send: (notifications: NotificationAttrs[]) => Promise<string> = async (notifications: NotificationAttrs[]) => {
        log.info('WEBSMS: SEND NOTIFICATION - ', { message: this.#message, to: this.#to });

        const response = await this.#WebSMS.sms(this.#message).to(this.#to).send()
            .then(response => {
                log.info(`WEBSMS: RESPONSE`, response);

                let status = Status.COMPLETED;
                if (response.ErrorCode !== 0) {
                    log.alert(response.ErrorDescription, response);

                    status = Status.FAILED;
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

                return { status: Status.FAILED, response: error };
            });

        const webSmsCallback = await this.#saveCallback(notifications, response);

        return webSmsCallback?.every(cb => (cb.status === Status.COMPLETED)) ? Status.COMPLETED : Status.FAILED;
    };

    #saveCallback = async (notifications:NotificationAttrs[], callback: any): Promise<WebsmsCallbackAttrs[]|undefined> => {
        return await db.WebsmsCallback.bulkCreate(callback.response.Data.map((response: any) => {
            const notification = notifications!.find(notification => {
                return String(notification.destination).slice(-9) == String(response.MobileNumber).slice(-9);
            });

            if (notification) {
                const status = response.MessageErrorCode === 0 ? Status.COMPLETED : Status.FAILED;

                notification.status = status;
                notification.provider = Provider.WEBSMS;
                notification.save();

                return {
                    notification_id: notification.id,
                    message_id     : response.MessageId,
                    phone          : response.MobileNumber,
                    description    : response.MessageErrorDescription,
                    status_code    : response.MessageErrorCode,
                    status         : status
                };
            }
        }));
    };
}
