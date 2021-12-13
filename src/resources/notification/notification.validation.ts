import Joi from 'joi'

const create = Joi.object({
    channel: Joi.string().required(),
    to: Joi.string().required(),
    content: Joi.string().required(),
})

export default {create}