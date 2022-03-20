import Joi from 'joi';

export const NotificationRequest = {
        store: Joi.object({
            channel: Joi.string().valid('slack', 'sms', 'mail', 'app').required(),
            content: Joi.string().required(),
            event_type: Joi.string().valid(
                'AIRTIME_PURCHASE', 'AIRTIME_PURCHASE_FAILURE',
                'UTILITY_PAYMENT', 'UTILITY_PAYMENT_FAILURE',
                'VOUCHER_PURCHASE', 'VOUCHER_REFUND',
                'WITHDRAWAL_PAYMENT', 'WITHDRAWAL_FAILURE',
                'REFERRAL_INVITE', 'REFERRAL_JOINED',
                'SUBSCRIPTION_PAYMENT',
                'MERCHANT_PAYMENT',
                'PAYMENT_FAILURE',
                'ERROR_ALERT',
                'STATUS_UPDATE',
                'SP_REQUEST_FAILURE',
                'TEST', 'DEFAULT'
            ).default('DEFAULT'),
            destination: Joi
                .when('channel', {
                    is: 'sms',
                    then: Joi.alternatives().try(
                        Joi.array().items(Joi.number().integer()),
                        Joi.number().integer()).required()
                }).when('channel', {
                    is: 'mail',
                    then: Joi.alternatives().try(Joi.array().items(Joi.string().email()), Joi.string().email()).required()
                })
        }),
        retry: Joi.object({
            id: Joi.string().required()
        })
    }
;
