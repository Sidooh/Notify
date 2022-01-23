import Joi from 'joi';

export const validateNotification = {
    create: Joi.object({
        channel: Joi.string().valid('slack', 'sms', 'mail', 'app').required(),
        content: Joi.string().required(),
        event_type: Joi.string().valid('AIRTIME_PURCHASE', 'UTILITY_PURCHASE', 'SUBSCRIPTION_PURCHASE', 'VOUCHER_PURCHASE', 'FAILED_PAYMENT', 'VOUCHER_REFUND', 'REFERRAL_JOINED', 'TEST').default('DEFAULT'),
        destination: Joi
            .when('channel', {
                is: 'sms',
                then: Joi.alternatives().try(
                    Joi.array().items(Joi.number().integer()),
                    Joi.number().integer()).required(),
            }).when('channel', {
                is: 'mail',
                then: Joi.alternatives().try(Joi.array().items(Joi.string().email()), Joi.string().email()).required()
            }),
    }),
    retry: Joi.object({
        id: Joi.string().required()
    })
}
