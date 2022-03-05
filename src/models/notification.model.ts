import { Document, model, Schema } from 'mongoose';

export interface NotificationDoc extends Document {
    channel: string;
    channel_id: bigint;
    destination: string[];
    content: string;
    event_type:string,
    provider:string,
    notifiable_id: Schema.Types.ObjectId|any|null
    notifiable_type: string,
    status: string
}

const NotificationSchema = new Schema({
        channel: {
            type: String,
            required: true
        },
        channel_id: Number,
        destination: {
            type: Array,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        event_type: {
            type: String,
            required: true
        },
        notifiable_id: {
            type: Schema.Types.ObjectId,
            refPath: 'notifiable_type'
        },
        notifiable_type: {
            type: String,
            enum: ['ATCallback', 'WebsmsCallback', 'SafaricomCallback']
        },
        provider: String,
        status: String
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        },
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id

                delete ret._id
                delete ret.__v
            }
        }
    }
);

export const Notification = model<NotificationDoc>('Notification', NotificationSchema);
