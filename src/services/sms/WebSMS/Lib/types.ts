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