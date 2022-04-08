import NotificationInterface from '../../utils/interfaces/notification.interface';
import WebSMSService from './WebSMS/WebSMS.service';
import ATService from './AT/AT.service';
import { log } from '../../utils/logger';
import { SettingDoc } from '../../models/setting.model';
import { NotificationAttrs } from '../../../models/notification';
import { Status } from '../../utils/enums';

export default class SMS implements NotificationInterface {
    notifications;
    destinations;
    #SMSService;

    constructor(notifications: NotificationAttrs[], destinations: string[], smsSettings: SettingDoc[] | undefined) {
        this.notifications = notifications;
        this.destinations = destinations;

        const settings = {
            provider          : smsSettings?.find(setting => setting.type === 'default_sms_provider')?.value,
            websms_env        : smsSettings?.find(setting => setting.type === 'websms_env')?.value,
            africastalking_env: smsSettings?.find(setting => setting.type === 'africastalking_env')?.value
        };

        switch (settings.provider) {
            case 'africastalking':
                this.#SMSService = new ATService(settings.africastalking_env);
                break;
            default:
                this.#SMSService = new WebSMSService(settings.websms_env);
        }
    }

    send = async () => {
        const SMS = this.#SMSService.to(this.destinations).message(this.notifications[0].content);

        SMS.send()
            .then(async (response) => {
                console.log(response);
                for (const notification of this.notifications) {
                    const res = response.find(res => String(notification.destination).slice(-9) === String(res.phone).slice(-9));

                    notification.status = Status.FAILED;
                    notification.provider = res?.provider;
                    notification.notifiable_type = res?.notifiable_type;

                    if (res) {
                        notification.status = res.status;
                        notification.provider = res.provider;

                        if (res.notifiable_id) notification.notifiable_id = res.notifiable_id;

                        notification.notifiable_type = res.notifiable_type;
                    }

                    // console.log(notification)
                    log.info('SMS NOTIFICATION REQUEST COMPLETE - ', { id: notification.id });

                    await notification.save();
                }
            }).catch(err => log.error(err));
    };
}
