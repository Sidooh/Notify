import { Provider } from './enums';
import jwt from 'jsonwebtoken';
import { env } from './validate.env';
import moment from 'moment';
import NodeCache from 'node-cache';
import { prisma } from '../db/prisma';
import { SmsProvider } from '@prisma/client';

const Setting = prisma.setting;
const SmsProvider = prisma.smsProvider;
export type SMSSettings = { default_provider: string, websms_env: string, africastalking_env: string, providers: Partial<SmsProvider>[] }

export const Help = {
    getSettings: async (key: string | string[]) => {
        if (Array.isArray(key)) return await Setting.findMany({ where: { key: { in: key } } });

        const setting = await Setting.findUnique({ where: { key } });

        return setting?.value;
    },

    getSMSSettings: async (): Promise<SMSSettings> => {
        const providers = await SmsProvider.findMany({
            select: {
                id: true, name: true, priority: true, environment: true
            }
        });

        return {
            default_provider  : (await Setting.findUnique({ where: { key: 'default_sms_provider' } }))?.value,
            websms_env        : providers?.find(p => p.name === Provider.WEBSMS)?.environment,
            africastalking_env: providers?.find(p => p.name === Provider.AT)?.environment,
            providers         : providers?.sort((a, b) => a.priority - b.priority)
        };
    },

    sleep: s => new Promise(r => setTimeout(r, s * 1000)),

    testToken: 'Bearer ' + jwt.sign({ iat: moment().add(15, 'm').unix() }, env.JWT_KEY)
};

export const Cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });