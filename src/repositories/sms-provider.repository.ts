import { prisma } from '../db/prisma';
import { Prisma } from '@prisma/client';
import { log } from '../utils/logger';
import { BadRequestError } from '../exceptions/bad-request.err';

const SmsProvider = prisma.smsProvider;

export class SmsProviderRepository {
    async findMany(args?: Prisma.SmsProviderFindManyArgs) {
        return await SmsProvider.findMany(args);
    }

    async create(data: Prisma.SmsProviderCreateInput) {
        return await SmsProvider.create({ data });
    }
    update = async (data: Prisma.SmsProviderUpdateInput, where: Prisma.SmsProviderWhereUniqueInput) => {
        return await SmsProvider.update({ data, where });
    };
    async destroy(id: number) {
        try {
            return await SmsProvider.delete({ where: { id } });
        } catch (e) {
            log.error('Deletion Error', e)

            throw new BadRequestError('Unable to delete provider!')
        }
    }
}