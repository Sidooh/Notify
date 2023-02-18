import ServiceInterface from '../../../utils/interfaces/service.interface';
import { WebSms } from './Lib/client';
import { WebSmsConfig } from './Lib/types';
import { log } from '../../../utils/logger';
import { ENV, Provider, Status } from '../../../utils/enums';
import { Notification } from '../../../models/Notification';
import { Notifiable } from '../../../models/Notifiable';
import { env } from '../../../utils/validate.env';

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
        this.#to = to.map(phone => `254${String(phone).slice(-9)}`);

        return this;
    };

    message = (message: string) => {
        this.#message = message;

        return this;
    };

    balance = async () => {
        const response = await this.#WebSMS.balance();

        log.info('WEBSMS: BALANCE - ', { balance: response });

        return (Number((response).slice(3))).toFixed(2);
    };

    send: (notifications: Notification[]) => Promise<string> = async (notifications: Notification[]) => {
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

                return { status, response: response.Data };
            }).catch(error => {
                log.error(error);

                return { status: Status.FAILED, response: error };
            });

        const webSmsCallback = await this.#saveCallback(notifications, response);

        return webSmsCallback?.every(cb => (cb.status === Status.COMPLETED)) ? Status.COMPLETED : Status.FAILED;
    };

    #saveCallback = async (notifications: Notification[], callback: any): Promise<Notifiable[] | undefined> => {
        log.info(`WEBSMS: Save Callback`, { notifications, callback })

        const callbacks = Notifiable.create(notifications.map(notification => {
            const response = callback.response.find(res => {
                return String(notification.destination).slice(-9) == String(res.MobileNumber).slice(-9);
            });

            let status = response?.MessageErrorCode === 0 ? Status.COMPLETED : Status.FAILED;

            notification.status = status;
            notification.save();

            return {
                notification_id: notification.id,
                message_id     : response?.MessageId,
                phone          : response?.MobileNumber,
                description    : response?.MessageErrorDescription || callback.response[0].MessageErrorDescription,
                status_code    : response?.MessageErrorCode || callback.response[0].MessageErrorCode,
                provider       : Provider.WEBSMS,
                status
            };
        }));

        return await Notifiable.save(callbacks);
    };
}
