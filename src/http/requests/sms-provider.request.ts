import Joi, { ValidationError } from 'joi';
import { ENV, Provider } from '../../utils/enums';
import prisma from '../../db/prisma';
import { validateExists } from '../../utils/helpers';
import { NotifyRequest } from '../../utils/types';

const SMSProvider = prisma.smsProvider;

export const SmsProviderRequest: NotifyRequest = {
    store  : Joi.object({
        name       : Joi.string().valid(Provider.WAVESMS, Provider.WEBSMS, Provider.AT).external(async (value) => {
            const provider = await SMSProvider.findFirst({ where: { name: value } });

            if (provider) throw new ValidationError('Name already exists!', [{
                type   : 'any.invalid',
                path   : ['name'],
                message: 'Name already exists!'
            }], []);

            return value;
        }).required(),
        priority   : Joi.number().valid(1, 2, 3).external(async (value, helpers) => {
            const provider = await SMSProvider.findFirst({ where: { priority: value } });

            if (provider) throw new ValidationError('Priority already taken!', [{
                type   : 'any.invalid',
                path   : ['name'],
                message: 'Priority already taken!'
            }], []);

            return value;
        }).required(),
        environment: Joi.string().valid(...Object.values(ENV).map(e => e)).required()
    }),
    update : {
        params: Joi.object({
            provider: Joi.number().label('id').external(id => validateExists(SMSProvider, id)).required()
        }),
        body  : Joi.object({
            name       : Joi.string().valid(Provider.WAVESMS, Provider.WEBSMS, Provider.AT),
            priority   : Joi.number().valid(1, 2, 3),
            environment: Joi.string().valid(...Object.values(ENV).map(e => e))
        })
    },
    destroy: {
        params: Joi.object({
            provider: Joi.number().external(id => validateExists(SMSProvider, id)).required()
        })
    }
};
