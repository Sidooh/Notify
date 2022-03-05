import { Schema } from 'mongoose';

export type WebSmsConfig = {
    accessKey: string,
    apiKey: string,
    clientId: string,
    senderId: string,
}

export type WebSmsPayload = {
    to: string | string[],
    from: string | number | null,
    message: string
}

export type WebSmsCallback = {
    status: string,
    provider_id: Schema.Types.ObjectId | null,
    provider_type: string,
    response: {
        Data: Array<Object>
    }
}
