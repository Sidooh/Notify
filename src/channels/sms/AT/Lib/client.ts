import { AfricasTalkingCredentials } from './types';

export class AfricasTalking {
    public AT;

    constructor(credentials: AfricasTalkingCredentials) {
        this.AT = require('africastalking')(credentials);
        console.log(credentials);
    }

    public async application() {
        const { UserData } = await this.AT.APPLICATION.fetchApplicationData();

        return UserData;
    }

    public async send(options: { to: string[], from: string, message: string }) {
        return this.AT.SMS.send(options);
    }
}
