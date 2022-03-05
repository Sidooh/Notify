import { NextFunction, Request, RequestHandler, Response } from 'express';
import Joi from 'joi';
import { log } from '../../utils/logger';
import { RequestValidationError } from '../../utils/exceptions/request-validation.error';

export const ValidationMiddleware = (schema: Joi.Schema): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        };

        try {
            req.body = await schema.validateAsync(req.body, validationOptions);

            next();
        } catch (err: any) {
            log.error(err);

            const errors: Joi.ValidationErrorItem[] = [];

            err.details.forEach((err: Joi.ValidationErrorItem) => errors.push(err));

            throw new RequestValidationError(errors)
        }
    };
};