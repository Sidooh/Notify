import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Provider } from '../../utils/enums';
import db from '../../db/__mocks__/prisma';
import { SettingRepository } from '../setting.repository';
import { Setting } from '@prisma/client';

const repo = new SettingRepository;

const setting: Setting = {
    id        : 1n,
    key       : 'default_sms_provider',
    value     : Provider.WAVESMS,
    created_at: new Date,
    updated_at: new Date
};

describe('notification.repository', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('findMany', () => {
        it('should return a list of settings', async () => {
            db.setting.findMany.mockResolvedValueOnce([setting]);

            const settings = await repo.findMany();

            expect(settings).toStrictEqual([setting]);
        });

        it('should create new setting if not exists', async () => {
            db.setting.upsert.mockResolvedValueOnce(setting);

            const res = await repo.tweak('default_sms_provider', Provider.WAVESMS);

            expect(res).toStrictEqual(setting);
        });

        it('should create new setting if not exists', async () => {
            db.setting.upsert.mockResolvedValueOnce(setting);

            const res = await repo.tweak('default_sms_provider', Provider.WAVESMS);

            expect(res).toStrictEqual(setting);
        });
    });
});