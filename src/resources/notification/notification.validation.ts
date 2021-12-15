import Joi from 'joi'

const create = Joi.object({
    channel: Joi.string().valid('slack', 'sms', 'mail', 'app').required(),
    content: Joi.string().required(),
    destination: Joi
        .when('channel', {
            is: 'sms',
            then: Joi.alternatives().try(Joi.array().items(Joi.number()), Joi.number()),
        }).when('channel', {
            is: 'mail',
            then: Joi.alternatives().try(Joi.array().items(Joi.string().email()), Joi.string().email())
        }).required(),
})

export default {create}