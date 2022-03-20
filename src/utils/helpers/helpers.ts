import { Setting } from '../../models/setting.model';

export const Help = {
    getSettings: async (types: string|string[]) => {
        if(Array.isArray(types)) {
            const setting = await Setting.findOne({types}).exec();

            return setting?.value
        }

        return Setting.find({ types });
    },
}
