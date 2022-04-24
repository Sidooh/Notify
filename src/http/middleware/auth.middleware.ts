import { NextFunction, Request, Response } from 'express';
import { NotAuthorizedError } from '../../exceptions/not-authorized.err';

export const Auth = (req:Request, res:Response, next:NextFunction) => {
    if(!req.user) throw new NotAuthorizedError()

    next();
}
