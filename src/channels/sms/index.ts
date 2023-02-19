import NotificationInterface from '../../utils/interfaces/notification.interface';
import WebSMSService from './WebSMS/WebSMS.service';
import ATService from './AT/AT.service';
import { log } from '../../utils/logger';
import { Notification } from '../../models/Notification';
import { Channel, EventType, Provider, Status } from '../../utils/enums';
import { Help, SMSSettings } from '../../utils/helpers';
import NotificationRepository from '../../repositories/notification.repository';
import WaveSMSService from './WaveSMS/WaveSMS.service';

export default class SMS implements NotificationInterface {
    tries = 1;
    triedProviders = [];
    smsSettings: SMSSettings;
    notifications;
    destinations;
    #SMSService;

    constructor(notifications: Notification[], destinations: string[], smsSettings: SMSSettings) {
        this.notifications = notifications;
        this.destinations = destinations;
        this.smsSettings = smsSettings;
    }

    send = async () => {
        switch (this.smsSettings.default_provider) {
            case Provider.AT:
                this.#SMSService = new ATService(this.smsSettings.africastalking_env);
                break;
            case Provider.WEBSMS:
                this.#SMSService = new WebSMSService(this.smsSettings.websms_env);
                break;
            default:
                this.#SMSService = new WaveSMSService();
        }

        await this.#SMSService.to(this.destinations).message(this.notifications[0].content).send(this.notifications)
            .then(status => {
                log.info(`SMS NOTIFICATION REQUEST ${status} - `, { ids: this.notifications.map(n => n.id) });

                if (status === Status.FAILED) this.retry();
            }).catch(err => log.error(err));
    };

    retry = () => {
        Help.sleep(this.tries * 30).then(() => {
            if (this.tries > 2) {
                this.triedProviders.push(this.smsSettings.default_provider);
                this.smsSettings.providers = this.smsSettings.providers.filter(p => !this.triedProviders.includes(p.name));

                this.tries = 0;
            }

            if (this.smsSettings.providers?.length) {
                //  Find next provider with the highest priority
                this.smsSettings.default_provider = this.smsSettings.providers.reduce((prev, curr) => {
                    return prev.priority < curr.priority ? prev : curr;
                }).name;

                log.info(`RETRYING NOTIFICATION WITH ${this.smsSettings.default_provider} AFTER ${this.tries * 2}s`, { tries: this.tries });

                this.tries++;
                this.send();
            } else {
                let message = `Failed to send notification(s) to:\n`;
                this.notifications.map(n => message += `#${n.id} - ${n.destination}\n`);

                if (!this.smsSettings.providers?.length) message += `\n::: -> SMS Providers have not been set.`;

                NotificationRepository.notify(Channel.SLACK, message, EventType.ERROR_ALERT, ['Sidooh']);
            }
        });
    };
}
