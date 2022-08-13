import { Setting, SMSProvidersSettingValue } from '../models/Setting';
import { In } from 'typeorm';
import { ENV, Provider } from './enums';

export type SMSSettings = { default_provider: Provider, websms_env: ENV, africastalking_env: ENV, providers: SMSProvidersSettingValue[] }

export const Help = {
    getSettings: async (key: string | string[]) => {
        if (Array.isArray(key)) return Setting.findBy({ key: In(key) });

        const setting = await Setting.findOneBy({ key });

        return setting?.value;
    },

    getSMSSettings: async (): Promise<SMSSettings> => {
        const smsSettings = await Setting.findBy({ key: In(['default_sms_provider', 'sms_providers']) });

        const providers = smsSettings.find(s => s.key === 'sms_providers')?.value.data as SMSProvidersSettingValue[];

        return {
            default_provider  : smsSettings?.find(s => s.key === 'default_sms_provider')?.value.data as Provider,
            websms_env        : providers?.find(p => p.provider === Provider.WEBSMS)?.env,
            africastalking_env: providers?.find(p => p.provider === Provider.AT)?.env,
            providers         : providers?.sort((a, b) => a.priority - b.priority)
        };
    }
};

export const sleep = s => new Promise(r => setTimeout(r, s * 1000));
