import Joi from 'joi'

const create = Joi.object({
    channel: Joi.string().valid('slack', 'sms', 'mail', 'app').required(),
    content: Joi.string().required(),
    destination: Joi.when('channel', {
        is: 'sms',
        then: Joi.alternatives().try(Joi.array().items(Joi.number()), Joi.number()),
        otherwise: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string())
    }).required(),
})

export default {create}