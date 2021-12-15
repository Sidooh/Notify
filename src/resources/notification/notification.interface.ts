import {Document} from "mongoose";

export default interface INotification extends Document {
    channel: string;
    channel_id: bigint;
    destination: string;
    content: string;
    status: string
}