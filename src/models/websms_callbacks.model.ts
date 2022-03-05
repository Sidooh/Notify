import { Document, model, Schema } from 'mongoose';

interface WebsmsCallbackDoc extends Document {
    // message_id: string
    // phone: string
    // description: string
    // status_code: number
    // status: string
    data: [{
        message_id: string
        phone: string
        description: string
        status_code: number
        status: string
    }]
}

const WebsmsCallbackSchema = new Schema(
    {
        // message_id: String,
        // phone: String,
        // description: String,
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
                ret.id = ret._id;

                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

export const WebsmsCallback = model<WebsmsCallbackDoc>('WebsmsCallback', WebsmsCallbackSchema);
