import INotification from "@/resources/notification/notification.interface";
import IMail from "@/services/mail/mail.interface";
import ISlack from "@/services/slack/slack.interface";

export default interface NotificationInterface {
    notification: INotification;
    data: IMail | ISlack

    send(): Promise<void>;
}