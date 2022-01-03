import {Document} from "mongoose";

export interface INotification extends Document {
    channel: string;
    channel_id: bigint;
    destination: string[];
    content: string;
    status: string
}

export interface IATCallback extends Document {
    message_id: string
    phone: string
    status_code: number
    status: string
}

export interface IWebsmsCallback extends Document {
    message_id: string
    phone: string
    description: string,
    status_code: number
    status: string
}

export interface ISetting extends Document {
    type: string
    value: string
}
