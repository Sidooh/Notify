import { Setting } from '../models/Setting';
import { In } from 'typeorm';

export const Help = {
    getSettings: async (key: string | string[]) => {
        if (Array.isArray(key)) return Setting.findBy({ key: In(key) });

        const setting = await Setting.findOneBy({ key });

        return setting?.value;
    },

    getSMSSettings: async () => {
        const smsSettings = await Setting.findBy({ key: In(['default_sms_provider', 'websms_env', 'africastalking_env']) });

        return {
            provider          : smsSettings?.find(setting => setting.key === 'default_sms_provider')?.value,
            websms_env        : smsSettings?.find(setting => setting.key === 'websms_env')?.value,
            africastalking_env: smsSettings?.find(setting => setting.key === 'africastalking_env')?.value
        };
    }
};
