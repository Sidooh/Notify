import { Setting } from '../../models/setting.model';

export const Help = {
    getSetting: async (type: string) => {
        const setting = await Setting.findOne({type}).exec();

        return setting?.value
    }
}
