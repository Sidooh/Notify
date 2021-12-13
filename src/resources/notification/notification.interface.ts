import {Document} from "mongoose";

export default interface Post extends Document {
    channel: string;
    to: string;
    content: string;
}