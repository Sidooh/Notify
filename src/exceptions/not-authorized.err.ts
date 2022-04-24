import { CustomError } from './custom.err';

export class NotAuthorizedError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Not Authorized!');

        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }

    serializeErrors(): { message: string; field?: string }[] {
        return [{message: 'Not Authorized!!'}];
    }
}