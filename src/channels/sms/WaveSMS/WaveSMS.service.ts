import ServiceInterface from '../../../utils/interfaces/service.interface';
import { log } from '../../../utils/logger';
import { Provider, Status } from '../../../utils/enums';
import { Notification } from '../../../models/Notification';
import { Notifiable } from '../../../models/Notifiable';
import { env } from '../../../utils/validate.env';
import { WaveSMS, WaveSMSConfig, WaveSMSResponse } from '@nabcellent/wavesms';

export default class WaveSMSService implements ServiceInterface {
    #message: string = '';
    #to: string[] = [];
    #WaveSMS: WaveSMS;

    constructor() {
        let config: WaveSMSConfig = {
            apiKey   : env.WAVE_SMS_API_KEY,
            partnerId: env.WAVE_SMS_PARTNER_ID,
            senderId : env.WAVE_SMS_SENDER_ID
        };

        this.#WaveSMS = new WaveSMS(config);
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
        const response = await this.#WaveSMS.balance.fetch();

        log.info('WAVESMS: BALANCE - ', { balance: response });

        return response;
    };

    send: (notifications: Notification[]) => Promise<string> = async (notifications: Notification[]) => {
        log.info('WAVESMS: SEND NOTIFICATIONS - ', { notifications });

        const responses = await this.#WaveSMS.sms.text(this.#message).to(this.#to).send()
            .then(data => {
                log.info(`WAVESMS: RESPONSES`, data);

                return data;
            }).catch(error => {
                log.error(error);

                throw new Error(error);
            });

        const waveSmsResponse = await this.#save(notifications, responses);

        return waveSmsResponse?.every(r => (r.status === Status.COMPLETED)) ? Status.COMPLETED : Status.FAILED;
    };

    #save = async (notifications: Notification[], responses: WaveSMSResponse[]): Promise<Notifiable[] | undefined> => {
        log.info(`WAVESMS: Save Response`);

        const notifiables = Notifiable.create(notifications.map(notification => {
            let response = responses.find(res => {
                return String(notification.destination).slice(-9) == String(res.mobile).slice(-9);
            });

            let status = response?.['response-code'] === 200 ? Status.COMPLETED : Status.FAILED;

            notification.status = status;
            notification.save();

            return {
                notification_id: notification.id,
                message_id     : response?.messageid as string,
                phone          : String(response.mobile),
                description    : response['response-description'],
                status_code    : response['response-code'],
                provider       : Provider.WAVESMS,
                status
            };
        }));

        return await Notifiable.save(notifiables);
    };
}
