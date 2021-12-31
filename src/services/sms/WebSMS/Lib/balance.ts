import {WebSms} from "./client";

export class Balance {
    private client: WebSms;

    constructor(client: WebSms) {
        this.client = client;
    }

    public async fetch() {
        const {data} = await this.client.http.get("/Balance", {
            params: {
                ApiKey: this.client.config.apiKey,
                ClientId: this.client.config.clientId,
            }
        });

        return data;
    }
}
