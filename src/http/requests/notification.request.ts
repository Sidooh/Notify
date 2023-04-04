import Joi from 'joi';
import { Channel, EventType } from '../../utils/enums';
import { parsePhoneNumber } from 'libphonenumber-js';
import { NotifyRequest } from '../../utils/types';
import { validateExists } from '../../utils/helpers';
import prisma from '../../db/prisma';

export const NotificationRequest: NotifyRequest = {
        index: {
            query: Joi.object({
                with   : Joi.string().valid('notifiables').insensitive(),
                channel: Joi.string().valid(...Object.values(Channel).map(c => c)).insensitive()
            })
        },
        store: Joi.object({
            channel    : Joi.string().valid(...Object.values(Channel).map(c => c)).insensitive().required(),
            content    : Joi.string().required(),
            event_type : Joi.string().uppercase().default(EventType.DEFAULT),
            destination: Joi
                .when('channel', {
                    is  : Channel.SMS,
                    then: Joi.array().items(Joi.number().integer()).single().custom((value, helpers) => {
                        value = value.map(p => {
                            const phoneNumber = parsePhoneNumber(String(p), 'KE');

                            if (!phoneNumber.isValid()) throw new Error(`Invalid phone number: ${p}`);

                            return phoneNumber.number.replace('+', '');
                        });

                        return value;
                    }, 'phone validation').required()
                }).when('channel', {
                    is  : Channel.MAIL,
                    then: Joi.alternatives().try(Joi.array().items(Joi.string().email()), Joi.string().email()).required()
                })
        }),
        retry: {
            params: Joi.object({
                notification: Joi.number().external(id => validateExists(prisma.notification, id)).required()
            })
        },
        checkNotification: {
            params: Joi.object({
                notification: Joi.number().external(id => validateExists(prisma.notification, id)).required()
            })
        }
    }
;
