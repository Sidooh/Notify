import NotificationInterface from '../../utils/interfaces/notification.interface';
import WebSMSService from './WebSMS/WebSMS.service';
import ATService from './AT/AT.service';
import { log } from '../../utils/logger';
import { Notification } from '@prisma/client';
import { Provider, Status } from '../../utils/enums';
import { SMSSettings } from '../../utils/helpers';
import NotificationRepository from '../../repositories/notification.repository';
import WaveSMSService from './WaveSMS/WaveSMS.service';
import { env } from '../../utils/validate.env';
import WasilianaService from './Wasiliana/Wasiliana.service';
import SmsServiceInterface from '../../utils/interfaces/sms-service.interface';

export class SMS implements NotificationInterface {
    tries = 1;
    retryCount = 0;
    currentProviderIndex = 0;
    smsSettings: SMSSettings;
    notifications: Notification[];
    service: SmsServiceInterface;
    repo: NotificationRepository;

    constructor(notifications: Notification[], smsSettings: SMSSettings) {
        this.notifications = notifications;
        this.smsSettings = smsSettings;

        this.repo = new NotificationRepository;
    }

    send = async () => {
        this.smsSettings.providers.sort((a, b) => a.priority - b.priority);

        await this.#dispatch(this.currentProviderIndex);
    };

    #dispatch = async i => {
        let provider = this.smsSettings.providers[i]?.name;

        if (!provider) {
            provider = this.smsSettings.default_provider
            log.warning(`Providers not set! Defaulting to ${provider}`)
        }

        switch (provider) {
            case Provider.AT:
                this.service = new ATService(this.smsSettings.africastalking_env);
                break;
            case Provider.WEBSMS:
                this.service = new WebSMSService(this.smsSettings.websms_env);
                break;
            case Provider.WAVESMS:
                this.service = new WaveSMSService(this.smsSettings.wavesms_env);
                break;
            default:
                this.service = new WasilianaService(this.smsSettings.wasiliana_env);
        }

        log.info(`Sending SMS with ${provider}...`, this.notifications);

        await this.service.to(this.notifications.map(n => n.destination)).message(this.notifications[0].content).send(this.notifications)
            .then(async results => {
                log.info(`SMS NOTIFICATION RESPONSE - `, results);

                if (results.COMPLETED && results.COMPLETED.length > 0) {
                    this.repo.updateMany({ status: Status.COMPLETED }, { id: { in: results.COMPLETED } });
                }

                if (results.FAILED && results.FAILED.length > 0) {
                    log.info(`Failed to send SMS with ${provider}`);
                    this.retryCount++;

                    this.notifications = await this.repo.findMany({ where: { id: { in: results.FAILED } } });

                    if (this.retryCount < env.SMS_RETRIES) {
                        // Incremental delay of 30 seconds per retry
                        const delay = this.retryCount * env.SMS_RETRY_INTERVAL;

                        log.info(`Retrying with ${provider} (${this.retryCount} attempt) in ${delay} seconds...`);

                        setTimeout(async () => await this.#dispatch(i), delay * 1000);
                    } else if (i < this.smsSettings.providers.length - 1) {
                        // Move to the next provider with the highest priority
                        this.currentProviderIndex++;
                        this.retryCount = 0;

                        log.info(`Moving to the next provider: ${this.smsSettings.providers[this.currentProviderIndex].name}`);

                        await this.#dispatch(this.currentProviderIndex);
                    } else {
                        // All providers failed
                        log.error('All SMS providers failed. Unable to send SMS.');
                    }
                }
            }).catch(err => log.error(err));
    };
}
