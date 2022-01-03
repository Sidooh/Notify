import {INotification} from "@/models/interfaces";

export default interface NotificationInterface {
    notification: INotification;

    send(): Promise<void>;
}
