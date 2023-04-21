import db from '../db/prisma';
import { log } from '../utils/logger';
import { BadRequestError } from '../exceptions/bad-request.err';
import FileCache from '../utils/cache/FileCache';

const Setting = db.setting;

export class SettingRepository {
    async findMany() {
        return await Setting.findMany();
    }

    async tweak(key: string, value: string) {
        FileCache.forget('sms_provider_settings')

        return await Setting.upsert({ where: { key }, update: { value }, create: { key, value } });
    };

    async destroy(id: number) {
        try {
            return await Setting.delete({ where: { id } });
        } catch (e) {
            log.error('Deletion Error', e)

            throw new BadRequestError('Unable to delete setting!')
        }
    }
}