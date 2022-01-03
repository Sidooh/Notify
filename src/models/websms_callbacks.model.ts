import {model, Schema} from "mongoose";
import {IWebsmsCallback} from "@/models/interfaces";

const WebsmsCallbackSchema = new Schema(
    {
        message_id: String,
        phone: String,
        description: String,
        status_code: Number,
        status: String
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

export const WebsmsCallback = model<IWebsmsCallback>('WebsmsCallback', WebsmsCallbackSchema)
