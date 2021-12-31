import INotification from "@/resources/notification/notification.interface";

export default interface NotificationInterface {
    notification: INotification;

    send(): Promise<void>;
}