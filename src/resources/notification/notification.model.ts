import {model, Schema} from "mongoose";
import INotification from "@/resources/notification/notification.interface";

const NotificationSchema = new Schema(
    {
        channel: {
            type: String,
            required: true
        },
        channel_id: {
            type: Number,
        },
        destination: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        status: {
            type: String,
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

export default model<INotification>('Notification', NotificationSchema)