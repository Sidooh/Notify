import Joi from 'joi'

export const validateNotification = {
    create: Joi.object({
        channel: Joi.string().valid('slack', 'sms', 'mail', 'app').required(),
        content: Joi.string().required(),
        destination: Joi
            .when('channel', {
                is: 'sms',
                then: Joi.alternatives().try(
                    Joi.array().items(Joi.number().integer()),
                    Joi.number().integer()),
            }).when('channel', {
                is: 'mail',
                then: Joi.alternatives().try(Joi.array().items(Joi.string().email()), Joi.string().email())
            }).required(),
    })
}
