import { Provider, Telco } from './enums';
import jwt from 'jsonwebtoken';
import { env } from './validate.env';
import moment from 'moment';
import db from '../db/prisma';
import { SmsProvider } from '@prisma/client';
import { ValidationError } from 'joi';
import FileCache from './cache/FileCache';

const Setting = db.setting;
const SmsProvider = db.smsProvider;
export type SMSSettings = {
    default_provider: string,
    websms_env?: string,
    wavesms_env?: string,
    africastalking_env?: string,
    providers: SmsProvider[]
}

export const Help = {
    getSettings: async (key: string | string[]) => {
        if (Array.isArray(key)) return await Setting.findMany({ where: { key: { in: key } } });

        const setting = await Setting.findUnique({ where: { key } });

        return setting?.value;
    },

    getSMSSettings: async (): Promise<SMSSettings> => {
        return await FileCache.remember('sms_provider_settings', (3600 * 24 * 30), async () => {
            const providers = await SmsProvider.findMany({
                select: { id: true, name: true, priority: true, environment: true }
            });

            return {
                default_provider  : (await Setting.findUnique({ where: { key: 'default_sms_provider' } }))?.value ?? Provider.WEBSMS,
                websms_env        : providers?.find(p => p.name === Provider.WEBSMS)?.environment,
                wavesms_env       : providers?.find(p => p.name === Provider.WAVESMS)?.environment,
                africastalking_env: providers?.find(p => p.name === Provider.AT)?.environment,
                providers         : providers?.sort((a, b) => a.priority - b.priority) as SmsProvider[]
            };
        });
    },

    sleep: s => new Promise(r => setTimeout(r, s * 1000)),

    testToken: 'Bearer ' + jwt.sign({ iat: moment().add(15, 'm').unix() }, env.JWT_KEY)
};

export const validateExists = async (model, id) => {
    const entity = await model.findUnique({ where: { id } });

    if (!entity) throw new ValidationError(`${model.name} Not Found!`, [{
        type   : 'any.invalid',
        path   : ['name'],
        message: `${model.name} Not Found!`
    }], []);

    return entity;
};

export const getTelcoFromPhone = (phone: string | number) => {
    phone = String(phone);

    const safRegEx = /^(?:254|\+254|0)?((?:7(?:[0129]\d|4[0123568]|5[789]|6[89])|(1(1[0-5])))\d{6})$/,
        airtelRegEx = /^(?:254|\+254|0)?((?:(7(?:(3\d)|(5[0-6])|(6[27])|(8\d)))|(1(0[0-6])))\d{6})$/,
        telkomRegEx = /^(?:254|\+254|0)?(7(7\d)\d{6})$/,
        equitelRegEx = /^(?:254|\+254|0)?(7(6[3-6])\d{6})$/,
        faibaRegEx = /^(?:254|\+254|0)?(747\d{6})$/;

    if (phone.match(safRegEx)) {
        return Telco.SAFARICOM;
    } else if (phone.match(airtelRegEx)) {
        return Telco.AIRTEL;
    } else if (phone.match(telkomRegEx)) {
        return Telco.TELKOM;
    } else if (phone.match(equitelRegEx)) {
        return Telco.EQUITEL;
    } else if (phone.match(faibaRegEx)) {
        return Telco.FAIBA;
    }
};