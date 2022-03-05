import NotificationInterface from '@/utils/interfaces/notification.interface';
import WebSMSService from '@/channels/sms/WebSMS/WebSMS.service';
import { INotification } from '@/models/interfaces';
import ATService from '@/channels/sms/AT/AT.service';

export default class SMS implements NotificationInterface {
    notification: INotification;
    #SMSService;

    constructor(notification: INotification, provider: string | undefined) {
        this.notification = notification;

        //TODO(Add better logic to select service based on settings)
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
            });
    };
}
