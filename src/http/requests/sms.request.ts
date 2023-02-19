import Joi from 'joi';
import { ENV, Provider } from '../../utils/enums';

export const SMSRequest = {
    upsertProvider: Joi.object({
        name       : Joi.string().valid(Provider.WAVESMS, Provider.WEBSMS, Provider.AT).required(),
        priority   : Joi.number().valid(1, 2).required(),
        environment: Joi.string().valid(...Object.values(ENV).map(e => e)).required()
    })
};
