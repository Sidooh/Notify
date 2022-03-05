import { Setting } from '@/models/setting.model';
import { log } from '@/utils/logger';
import { ISetting } from '@/models/interfaces';

class SettingService {
    // Fetch all settings
    async index() {
        try {
            return await Setting.find({})
        } catch (err) {
            log.error(err)
            throw new Error('Unable to fetch settings!')
        }
    }

    // Tweak settings
    async tweak(setting: ISetting): Promise<ISetting> {
        try {
            await Setting.updateOne({type: setting.type}, setting, {upsert: true});

            return await Setting.findOne({type: setting.type}) as ISetting
        } catch (err) {
            log.error(err)
            throw new Error('Unable to tweak settings!')
        }
    }
}

export default SettingService
