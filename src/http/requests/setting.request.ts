import Joi from 'joi';
import { Provider } from '../../utils/enums';

export const SettingRequest = {
    create: Joi.object({
        id   : Joi.number(),
        key  : Joi.string().valid('default_sms_provider', 'sms_providers', 'mail_providers').required(),
        value: Joi.when('key', {
            is  : 'default_sms_provider',
            then: Joi.string().valid(Provider.AT, Provider.WEBSMS)
        }).required()
            .when('key', {
                is  : 'mail_providers',
                then: Joi.array().items(Joi.object({
                    provider: Joi.string().valid(Provider.GMAIL),
                    priority: Joi.number().valid(1).required(),
                }))
            }).required()
            .when('key', {
                is  : 'sms_providers',
                then: Joi.array().items(Joi.object({
                    provider: Joi.string().valid(Provider.AT, Provider.WEBSMS),
                    priority: Joi.number().valid(1, 2).required(),
                    env     : Joi.string().valid('development', 'production').required()
                })).unique((a, b) => a.provider === b.provider || a.priority === b.priority)
            }).required()
    })
};
