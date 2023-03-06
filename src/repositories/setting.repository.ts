import db from '../db/prisma';
import { log } from '../utils/logger';
import { BadRequestError } from '../exceptions/bad-request.err';

const Setting = db.setting;

export class SettingRepository {
    async findMany() {
        return await Setting.findMany();
    }

    async tweak(key: string, value: string) {
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