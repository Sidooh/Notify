import { NextFunction, Request, RequestHandler, Response } from 'express';
import Joi from 'joi';
import { ValidationError } from '../../exceptions/validation.err';
import { log } from '../../utils/logger';

export const validate = (schema: Joi.Schema): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const validationOptions = {
            abortEarly  : false,
            allowUnknown: true,
            stripUnknown: true
        };

        try {
            let data;
            if (['post', 'put', 'patch'].includes(req.method.toLowerCase())) {
                data = { ...req.query, ...req.params, ...req.body };
            } else {
                data = { ...req.body, ...req.params, ...req.query };
            }

            data = await schema.validateAsync(data, validationOptions);

            req.body = data;
            req.query = data;
            req.params = data;

            next();
        } catch (err: any) {
            log.error(err);

            const errors: Joi.ValidationErrorItem[] = [];

            err.details.forEach((err: Joi.ValidationErrorItem) => errors.push(err));

            throw new ValidationError(errors);
        }
    };
};