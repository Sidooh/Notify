import db from '../db/prisma';
import { Prisma, SmsProvider as SmsProviderType } from '@prisma/client';
import { log } from '../utils/logger';
import { BadRequestError } from '../exceptions/bad-request.err';

const SmsProvider = db.smsProvider;

export class SmsProviderRepository {
    async find(id: bigint) {
        return await SmsProvider.findUnique({ where: { id } });
    }

    async findMany(args?: Prisma.SmsProviderFindManyArgs) {
        return await SmsProvider.findMany(args);
    }

    async create(data: Prisma.SmsProviderCreateInput) {
        return await SmsProvider.create({ data });
    }

    update = async (data: Prisma.SmsProviderUpdateInput, where: Prisma.SmsProviderWhereUniqueInput) => {
        return await SmsProvider.update({ data, where });
    };

    async updatePriority(id: bigint, currentPriority: number, newPriority: number): Promise<SmsProviderType | null> {
        const count = await SmsProvider.count()

        await db.$queryRaw`UPDATE sms_providers
                           SET priority = CASE
                                              WHEN priority = ${currentPriority} THEN ${newPriority}
                                              WHEN ${newPriority} >= ${count} THEN
                                                  IF(priority <= ${newPriority}, priority - 1, priority)
                                              ELSE
                                                  IF(priority >= ${newPriority}, priority + 1, priority)
                               END`;

        return await this.find(id);
    };

    async destroy(id: bigint|number) {
        try {
            return await SmsProvider.delete({ where: { id } });
        } catch (e) {
            log.error('Deletion Error', e);

            throw new BadRequestError('Unable to delete provider!');
        }
    }
}