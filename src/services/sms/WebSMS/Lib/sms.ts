import {WebSms} from "./client";

export class Sms {
    #client: WebSms;
    #message: string = "";
    #phones: string[] = [];

    constructor(client: WebSms) {
        this.#client = client;
    }

    public text(message: string) {
        this.#message = message;
        return this;
    }

    public to(to: string[]) {
        this.#phones = to;

        return this;
    }

    public async send() {
        const MessageParameters = this.#phones.map((phone: string) => {
            return {
                Number: phone,
                Text: this.#message
            }
        })

        const {data} = await this.#client.http.post("/SendBulkSMS", {
            ApiKey: this.#client.config.apiKey,
            ClientId: this.#client.config.clientId,
            SenderId: this.#client.config.senderId,
            MessageParameters
        });

        return data;
    }
}
