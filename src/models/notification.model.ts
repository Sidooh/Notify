import { model, Schema } from 'mongoose';
import { INotification } from '@/models/interfaces';

const NotificationSchema = new Schema(
    {
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
            enum: ['AFRICASTALKING', 'WEBSMS', 'GMAIL', 'SLACK', 'SAFARICOM']
        },
        provider: String,
        status: String
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

export default model<INotification>('Notification', NotificationSchema);
