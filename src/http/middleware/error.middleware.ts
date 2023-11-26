import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../exceptions/custom.err';

export const ErrorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
    const message = error.message || 'Something went wrong';

    if (error instanceof CustomError) {
        let errorResponse = error.serializeErrors().length > 1
            ? { result: 0, errors: error.serializeErrors() }
            : { result: 0, message: error.serializeErrors()[0].message };

        return res.status(error.statusCode).send(errorResponse);
    }

    console.error(error);

    res.status(400).send({ result: 0, message });
};
