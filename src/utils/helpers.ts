import { Setting } from '../models/Setting';
import { In } from 'typeorm';

export const Help = {
    getSettings: async (type: string | string[]) => {
        if (Array.isArray(type)) return Setting.findBy({ type: In(type) });

        const setting = await Setting.findOneBy({ type });

        return setting?.value;
    },

    uppercaseFirst: (str: string) => `${str[0].toUpperCase()}${str.substring(1)}`
};
