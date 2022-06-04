import { Setting } from '../models/Setting';
import { In } from 'typeorm';

export const Help = {
    getSettings: async (type: string | string[]) => {
        if (Array.isArray(type)) return Setting.findBy({ type: In(type) });

        const setting = await Setting.findOneBy({ type });

        return setting?.value;
    },

    // TODO: There is no inbuilt js function for UCFirst or something?
    uppercaseFirst: (str: string) => `${str[0].toUpperCase()}${str.substring(1)}`,

    getSMSSettings: async () => {
        const smsSettings = await Setting.findBy({ type: In(['default_sms_provider', 'websms_env', 'africastalking_env']) });

        return {
            provider          : smsSettings?.find(setting => setting.type === 'default_sms_provider')?.value,
            websms_env        : smsSettings?.find(setting => setting.type === 'websms_env')?.value,
            africastalking_env: smsSettings?.find(setting => setting.type === 'africastalking_env')?.value
        };
    }
};
