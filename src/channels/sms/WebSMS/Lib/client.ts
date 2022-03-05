import { WebSmsConfig } from './types';
import { Balance } from './balance';
import { Sms } from './sms';
import axios, { AxiosInstance } from 'axios';

export class WebSms {
    #env = "live";
    public config: WebSmsConfig = {
        accessKey: "",
        apiKey: "",
        clientId: "",
        senderId: ""
    };

    public endpoint = String(process.env.WEBSMS_API_URL) ?? "https://api.onfonmedia.co.ke/v1/sms";

    public http: AxiosInstance;

    constructor(config: WebSmsConfig, env: string = "live") {
        this.config = config;
        this.#env = env;

        if (this.#env === "sandbox") {
            this.config.senderId = "Wyzer";
        }

        this.http = axios.create({
            baseURL: this.endpoint,
            headers: {
                Accept: "application/json",
                AccessKey: this.config.accessKey,
                ContentType: 'application/json'
            },
        });
    }

    public async balance() {
        // const {
        //     data: { balance },
        // } = await axios.get("/Balance");

        const balance = new Balance(this);
        return balance.fetch();

        // return balance;
    }

    public sms(message: string): Sms {
        const sms = new Sms(this);
        sms.text(message);

        return sms;
    }

}
