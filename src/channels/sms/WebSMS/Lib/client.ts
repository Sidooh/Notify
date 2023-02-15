import { WebSmsConfig } from './types';
import { Balance } from './balance';
import { Sms } from './sms';
import axios, { AxiosInstance } from 'axios';
import { env } from '../../../../utils/validate.env';

export class WebSms {
    public config: WebSmsConfig;
    public endpoint = env.WEBSMS_API_URL;
    public http: AxiosInstance;

    constructor(config: WebSmsConfig) {
        this.config = config;

        this.http = axios.create({
            baseURL: this.endpoint,
            headers: {
                Accept: 'application/json',
                AccessKey: this.config.accessKey,
                ContentType: 'application/json'
            }
        });
    }

    public async balance() {
        const balanceClass = new Balance(this);

        const { Data } = await balanceClass.fetch();
        const { Credits } = Data.find((data: any) => data.PluginType === 'SMS')

        return Credits;
    }

    public sms(message: string): Sms {
        const sms = new Sms(this);
        sms.text(message);

        return sms;
    }
}
