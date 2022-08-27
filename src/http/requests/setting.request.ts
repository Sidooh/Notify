import Joi from 'joi';
import { Provider } from '../../utils/enums';

export const SettingRequest = {
    create: Joi.object({
        id   : Joi.number(),
        key  : Joi.string().valid('default_sms_provider', 'default_mail_provider').required(),
        value: Joi.when('key', {
            is  : 'default_sms_provider',
            then: Joi.string().valid(Provider.AT, Provider.WEBSMS)
        }).required()
            .when('type', {
                is  : 'default_mail_provider',
                then: Joi.string().valid(Provider.GMAIL)
            }).required()
    })
};
