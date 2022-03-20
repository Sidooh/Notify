import { Setting } from '../../models/setting.model';

export const Help = {
    getSettings: async (type: string | string[]) => {
        if (Array.isArray(type)) return Setting.find({ type });

        const setting = await Setting.findOne({ type }).exec();

        return setting?.value;
    }
};
