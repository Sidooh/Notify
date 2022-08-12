import NotificationInterface from '../../utils/interfaces/notification.interface';
import WebSMSService from './WebSMS/WebSMS.service';
import ATService from './AT/AT.service';
import { log } from '../../utils/logger';
import { Notification } from '../../models/Notification';
import map from 'lodash/map';
import { Status } from '../../utils/enums';

export default class SMS implements NotificationInterface {
    triedProviders = [];
    provider;
    smsSettings;
    notifications;
    destinations;
    #SMSService;

    constructor(notifications: Notification[], destinations: string[], smsSettings) {
        this.notifications = notifications;
        this.destinations = destinations;
        this.smsSettings = smsSettings;
        this.provider = smsSettings.provider;
    }

    send = async () => {
        switch (this.provider) {
            case 'africastalking':
                this.#SMSService = new ATService(this.smsSettings.africastalking_env);
                break;
            default:
                this.#SMSService = new WebSMSService(this.smsSettings.websms_env);
        }

        const SMS = this.#SMSService.to(this.destinations).message(this.notifications[0].content);

        await SMS.send(this.notifications)
            .then(status => {
                log.info(`SMS NOTIFICATION REQUEST ${status} - `, { ids: map(this.notifications, 'id') })

                if(status === Status.FAILED) {
                    this.triedProviders.push(this.provider)

                    this.provider = 'africastalking';

                    this.send()
                }
            })
            .catch(err => log.error(err));
    };
}
