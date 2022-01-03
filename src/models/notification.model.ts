import {model, Schema} from "mongoose";
import {INotification} from "@/models/interfaces";

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
            type: Array,
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
