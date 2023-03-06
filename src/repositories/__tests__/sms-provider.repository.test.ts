import { describe, expect, it } from 'vitest';
import { Provider, Status } from '../../utils/enums';
import db from '../../db/__mocks__/prisma';
import { SmsProviderRepository } from '../sms-provider.repository';
import { SmsProvider } from '@prisma/client';

const repo = new SmsProviderRepository;

const smsProvider: SmsProvider = {
    id         : 1n,
    name       : Provider.WAVESMS,
    priority   : 1,
    environment: 'test',
    status     : Status.ACTIVE,
    created_at : new Date,
    updated_at : new Date
};

describe('sms-provider.repository', () => {
    describe('findMany', () => {
        it('should return a list of SMS Providers.', async () => {
            db.smsProvider.findMany.mockResolvedValueOnce([smsProvider]);

            const smsProviders = await repo.findMany();

            expect(smsProviders).toStrictEqual([smsProvider]);
        });
    });

    describe('create', () => {
        it('should create a new SMS Provider.', async () => {
            db.smsProvider.create.mockResolvedValueOnce(smsProvider);

            const res = await repo.create({
                name       : Provider.WAVESMS,
                priority   : 1,
                environment: 'test'
            });

            expect(res).toStrictEqual(smsProvider);
        });
    });

    describe('update', () => {
        it('should update an existing SMS Provider.', async () => {
            db.smsProvider.update.mockResolvedValueOnce({ ...smsProvider, priority: 2 });

            const res = await repo.update({ priority: 2 }, { id: 1 });

            expect(res).toStrictEqual({ ...smsProvider, priority: 2 });
        });
    });
});