import { NextFunction, Request, RequestHandler, Response } from 'express';
import Joi from 'joi';
import { ValidationError } from '../../exceptions/validation.err';
import { log } from '../../utils/logger';
import { NotifyRequestObjects } from '../../utils/types';

export const validate = (request: Joi.Schema | NotifyRequestObjects): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const validationOptions = {
            abortEarly  : false,
            allowUnknown: true,
            stripUnknown: true
        };

        try {
            if (Joi.isSchema(request)) {
                req.body = await request.validateAsync(req.body, validationOptions);
            } else {
                if (Joi.isSchema(request.query)) {
                    req.query = await request.query.validateAsync(req.query, validationOptions);
                }
                if (Joi.isSchema(request.params)) {
                    req.params = await request.params.validateAsync(req.params, validationOptions);
                    console.log(req.params, request.params);
                }
                if (Joi.isSchema(request.body)) {
                    req.body = await request.body.validateAsync(req.body, validationOptions);
                }
            }

            next();
        } catch (err: any) {
            log.error(err);

            const errors: Joi.ValidationErrorItem[] = [];

            err.details.forEach((err: Joi.ValidationErrorItem) => {
                err.message = err.message.replaceAll('"', '');

                errors.push(err);
            });

            throw new ValidationError(errors);
        }
    };
};