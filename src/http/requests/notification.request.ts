import Joi from 'joi';
import { Channel, EventType } from '../../utils/enums';

export const NotificationRequest = {
        store: Joi.object({
            channel: Joi.string().valid(...Object.values(Channel).map(c => c)).required(),
            content: Joi.string().required(),
            event_type: Joi.string().valid(...Object.values(EventType).map(e => e)).default(EventType.DEFAULT),
            destination: Joi
                .when('channel', {
                    is: Channel.SMS,
                    then: Joi.array().items(Joi.number().integer()).single().required()
                }).when('channel', {
                    is: Channel.MAIL,
                    then: Joi.alternatives().try(Joi.array().items(Joi.string().email()), Joi.string().email()).required()
                })
        }),
        retry: Joi.object({
            id: Joi.string().required()
        })
    }
;
