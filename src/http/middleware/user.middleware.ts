import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../utils/validate.env';

interface UserPayload {
    id: number;
    email: string;
    name: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

const bearerToken = (authorization: string) => {
    const bearer = authorization.split(' ');

    return bearer[1];
};

export const User = (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.jwt && !req.headers.authorization) return next();

    const token = req.cookies.jwt || bearerToken(String(req.headers.authorization));

    try {
        req.user = jwt.verify(token, env.JWT_KEY) as UserPayload;
    } catch (e) {
    }

    next();
};
