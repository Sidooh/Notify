import { Setting } from '../models/Setting';
import { In } from 'typeorm';
import { ENV, Provider } from './enums';
import { SMSProvider } from '../models/SMSProvider';

export type SMSSettings = { default_provider: Provider, websms_env: ENV, africastalking_env: ENV, providers: SMSProvider[] }

export const Help = {
    getSettings: async (key: string | string[]) => {
        if (Array.isArray(key)) return Setting.findBy({ key: In(key) });

        const setting = await Setting.findOneBy({ key });

        return setting?.value;
    },

    getSMSSettings: async (): Promise<SMSSettings> => {
        const providers = await SMSProvider.find({ select: ['id', 'name', 'priority'] });

        return {
            default_provider  : (await Setting.findOneBy({ key: 'default_sms_provider' }))?.value as Provider,
            websms_env        : providers?.find(p => p.name === Provider.WEBSMS)?.environment,
            africastalking_env: providers?.find(p => p.name === Provider.AT)?.environment,
            providers         : providers?.sort((a, b) => a.priority - b.priority)
        };
    }
};

export const sleep = s => new Promise(r => setTimeout(r, s * 1000));
