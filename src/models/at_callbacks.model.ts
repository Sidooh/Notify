import { Document, model, Schema } from 'mongoose';

interface ATCallbackDoc extends Document {
    // message_id: string
    // phone: string
    // status_code: number
    // status: string,
    data: [{
        message_id: string
        phone: string
        description: string
        status_code: number
        status: string
    }]
}

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

export const ATCallback = model<ATCallbackDoc>('ATCallback', ATCallbackSchema);
