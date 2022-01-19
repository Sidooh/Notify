import { model, Schema } from 'mongoose';
import { ISetting } from '@/models/interfaces';

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

export const Setting = model<ISetting>('Setting', SettingSchema);
