import {model, Schema} from "mongoose";
import INotification from "@/resources/notification/notification.interface";

const NotificationSchema = new Schema(
    {
        channel: {
            type: String,
            required: true
        },
        to: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
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