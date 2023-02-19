import { AfricasTalkingCredentials } from './types';
import africastalking from 'africastalking';

export class AfricasTalking {
    public AT;

    constructor(credentials: AfricasTalkingCredentials) {
        this.AT = africastalking(credentials);
    }

    public async application() {
        const { UserData } = await this.AT.APPLICATION.fetchApplicationData();

        return UserData;
    }

    public async send(options: { to: string[], from: string, message: string }) {
        return this.AT.SMS.send(options);
    }
}
