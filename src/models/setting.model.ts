import { Document, model, Schema } from 'mongoose';

export interface SettingDoc extends Document {
    type: string
    value: string
}

const SettingSchema = new Schema(
    {
        type: {
            type: String,
            required: true
        },
        value: String
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;

                delete ret._id;
                delete ret.__v;
            }
        }
    }
);

export const Setting = model<SettingDoc>('Setting', SettingSchema);
