import NotificationInterface from '@/utils/interfaces/notification.interface';
import WebSMSService from '@/channels/sms/WebSMS/WebSMS.service';
import ATService from '@/channels/sms/AT/AT.service';
import { log } from '@/utils/logger';
import { NotificationDoc } from '@/models/notification.model';

export default class SMS implements NotificationInterface {
    notification;
    #SMSService;

    constructor(notification: NotificationDoc, provider: string | undefined) {
        this.notification = notification;

        switch (provider) {
            case 'africastalking':
                this.#SMSService = new ATService();
                break;
            default:
                this.#SMSService = new WebSMSService();
        }
    }

    send = async (retry: boolean) => {
        let destinations = this.notification.destination;

        if (retry) {
            destinations = this.notification.notifiable_id.data.filter((notification: any) => notification.status === 'failed')
                .map((recipient: any) => recipient.phone.replace(/\+/g, ' '));
        }

        const SMS = this.#SMSService.to(destinations).message(this.notification.content);

        if (retry) SMS.notification(this.notification);

        SMS.send()
            .then(async ({ status, provider, notifiable_id, notifiable_type }) => {
                this.notification.status = status;
                this.notification.provider = provider;
                this.notification.notifiable_id = notifiable_id;
                this.notification.notifiable_type = notifiable_type;

                await this.notification.save();

                log.info('SMS NOTIFICATION SUCCESSFUL - ', { id: this.notification.id })
            }).catch(err => log.error(err));
    };
}
