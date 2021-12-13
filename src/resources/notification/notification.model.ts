import {model, Schema} from "mongoose";
import IPost from "@/resources/notification/notification.interface";

const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

export default model<IPost>('Post', PostSchema)