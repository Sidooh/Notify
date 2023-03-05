import Joi from 'joi';
import { Provider } from '../../utils/enums';
import { validateExists } from '../../utils/helpers';
import { prisma } from '../../db/prisma';

export const SettingRequest = {
    upsert: Joi.object({
        key  : Joi.string().valid('default_sms_provider', 'default_mail_provider').required(),
        value: Joi.when('key', {
            is  : 'default_sms_provider',
            then: Joi.string().valid(Provider.AT, Provider.WEBSMS, Provider.WAVESMS)
        }).required()
            .when('type', {
                is  : 'default_mail_provider',
                then: Joi.string().valid(Provider.GMAIL)
            }).required()
    }),
    destroy: Joi.object({
        id: Joi.number().external(id => validateExists(prisma.setting, id)).required()
    })
};
