import Joi from 'joi';

export type SMSNotificationResults = { COMPLETED: bigint[], FAILED: bigint[] }

export type NotifyRequestObjects = {
    query?: Joi.Schema,
    params?: Joi.Schema,
    body?: Joi.Schema
}

export type NotifyRequest = {
    [key: string]: Joi.Schema | NotifyRequestObjects
}
