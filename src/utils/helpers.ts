import { ENV, Provider } from './enums';
import jwt from 'jsonwebtoken';
import { env } from './validate.env';
import moment from 'moment';
import NodeCache from 'node-cache';
import db from '../db/prisma';
import { SmsProvider } from '@prisma/client';
import { ValidationError } from 'joi';

const Setting = db.setting;
const SmsProvider = db.smsProvider;
export type SMSSettings = { default_provider: string, websms_env: string, africastalking_env: string, providers: SmsProvider[] }

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
            default_provider  : (await Setting.findUnique({ where: { key: 'default_sms_provider' } }))?.value ?? Provider.WEBSMS,
            websms_env        : providers?.find(p => p.name === Provider.WEBSMS)?.environment ?? ENV.PRODUCTION,
            africastalking_env: providers?.find(p => p.name === Provider.AT)?.environment ?? ENV.PRODUCTION,
            providers         : providers?.sort((a, b) => a.priority - b.priority) as SmsProvider[]
        };
    },

    sleep: s => new Promise(r => setTimeout(r, s * 1000)),

    testToken: 'Bearer ' + jwt.sign({ iat: moment().add(15, 'm').unix() }, env.JWT_KEY)
};

export const Cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

export const validateExists = async (model, id) => {
    const provider = await model.findUnique({ where: { id } });

    if (!provider) throw new ValidationError(`${model.name} Not Found!`, [{
        type   : 'any.invalid',
        path   : ['name'],
        message: `${model.name} Not Found!`
    }], []);

    return id;
};