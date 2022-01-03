import {model, Schema} from "mongoose";
import {ISetting} from "@/models/interfaces";

const SettingSchema = new Schema(
    {
        type: {
            type: String,
            required: true
        },
        value: String
    }
)

export const Setting = model<ISetting>('Setting', SettingSchema)
