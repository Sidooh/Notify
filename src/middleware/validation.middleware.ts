import {NextFunction, Request, RequestHandler, Response} from "express";
import Joi from 'joi'

export default function ValidationMiddleware(schema: Joi.Schema): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true
        };

        try {
            req.body = await schema.validateAsync(req.body, validationOptions)

            next()
        } catch (e: any) {
            const errors: string[] = []

            e.details.forEach((err: Joi.ValidationErrorItem) => {
                errors.push(err.message)
            })

            res.status(400).send({errors})
        }
    }
}