import {model, Schema} from "mongoose";
import {INotification} from "@/models/interfaces";

const ATCallbackSchema = new Schema(
    {
        message_id: String,
        phone: {
            type: String,
            required: true
        },
        status_code: Number,
        status: String
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
    }
)

export const ATCallback = model<INotification>('ATCallback', ATCallbackSchema)
