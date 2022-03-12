import { AfricasTalkingCredentials } from './types';

export class AfricasTalking {
    public credentials: AfricasTalkingCredentials;
    public endpoint = String(process.env.WEBSMS_API_URL) ?? 'https://api.onfonmedia.co.ke/v1/sms';
    public AT;

    constructor(credentials: AfricasTalkingCredentials) {
        this.credentials = credentials;

        this.AT = require('africastalking')(credentials);
    }

    public async application() {
        const { UserData } = await this.AT.APPLICATION.fetchApplicationData();

        return UserData;
    }

    public async send(options: { to: string[], from: string, message: string }) {
        return this.AT.SMS.send(options);
    }
}
