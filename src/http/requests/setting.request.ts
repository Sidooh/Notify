import Joi from 'joi';
import { Provider } from '../../utils/enums';
import { validateExists } from '../../utils/helpers';
import prisma from '../../db/prisma';
import { NotifyRequest } from '../../utils/types';

// @ts-ignore
export const SettingRequest: NotifyRequest = {
    upsert : Joi.object({
        key  : Joi.string().valid('default_sms_provider', 'default_mail_provider').required(),
        value: Joi.when('key', {
            is  : 'default_sms_provider',
            then: Joi.string().valid(Provider.AT, Provider.WEBSMS, Provider.WAVESMS, Provider.WASILIANA)
        }).required()
            .when('type', {
                is  : 'default_mail_provider',
                then: Joi.string().valid(Provider.GMAIL)
            }).required()
    }),
    destroy: {
        params: Joi.object({
            setting: Joi.number().external(id => validateExists(prisma.setting, id)).required()
        })
    }
};
