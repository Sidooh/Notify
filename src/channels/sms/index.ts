import NotificationInterface from '../../utils/interfaces/notification.interface';
import WebSMSService from './WebSMS/WebSMS.service';
import ATService from './AT/AT.service';
import { log } from '../../utils/logger';
import { Notification } from '@prisma/client';
import { Channel, EventType, Provider, Status } from '../../utils/enums';
import { Help, SMSSettings } from '../../utils/helpers';
import NotificationRepository from '../../repositories/notification.repository';
import WaveSMSService from './WaveSMS/WaveSMS.service';

export class SMS implements NotificationInterface {
    tries = 1;
    triedProviders: string[] = [];
    smsSettings: SMSSettings;
    notifications: Notification[];
    destinations;
    service: ATService | WebSMSService | WaveSMSService;
    repo: NotificationRepository;

    constructor(notifications: Notification[], smsSettings: SMSSettings) {
        this.notifications = notifications;
        this.destinations = notifications.map(n => n.destination);
        this.smsSettings = smsSettings;

        this.repo = new NotificationRepository;
    }

    send = async () => {
        switch (this.smsSettings.default_provider) {
            case Provider.AT:
                this.service = new ATService(this.smsSettings.africastalking_env);
                break;
            case Provider.WEBSMS:
                this.service = new WebSMSService(this.smsSettings.websms_env);
                break;
            default:
                this.service = new WaveSMSService();
        }

        await this.service.to(this.destinations).message(this.notifications[0].content).send(this.notifications)
            .then(results => {
                log.info(`SMS NOTIFICATION RESPONSE - `, results);

                if (results.COMPLETED.length > 0) {
                    this.repo.updateMany({ status: Status.COMPLETED }, { id: { in: results.COMPLETED } });
                }

                if (results.FAILED.length > 0) {
                    this.repo.updateMany({ status: Status.FAILED }, { id: { in: results.FAILED } });

                    this.retry(results.FAILED);
                }
            }).catch(err => log.error(err));
    };

    retry = (ids: bigint[]) => {
        Help.sleep(this.tries * 45).then(async () => {
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

                this.notifications = await this.repo.findMany({ where: { id: { in: ids } } });

                this.send();
            } else {
                let message = `Failed to send notification(s) to:\n`;
                this.notifications.map(n => message += `#${n.id} - ${n.destination}\n`);

                if (!this.smsSettings.providers?.length) message += `\n::: -> SMS Providers have not been set.`;

                this.repo.notify(Channel.SLACK, message, EventType.ERROR_ALERT, ['Sidooh']);
            }
        });
    };
}
