import { model, Schema } from 'mongoose';
import { INotification } from '@/models/interfaces';

const ATCallbackSchema = new Schema(
    {
        // message_id: String,
        // phone: {
        //     type: String,
        //     required: true
        // },
        // status_code: Number,
        // status: String,
        data: [{
            message_id: String,
            phone: String,
            description: String,
            status_code: Number,
            status: String
        }]
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

export const ATCallback = model<INotification>('ATCallback', ATCallbackSchema);
