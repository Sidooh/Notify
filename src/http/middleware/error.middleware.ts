import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../exceptions/custom.err';

export const ErrorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    const message = error.message || 'Something went wrong';

    if (error instanceof CustomError) {
        return res.status(error.statusCode).send({errors: error.serializeErrors()});
    }

    console.error(error);

    res.status(400).send({errors: [{message}]});
};
