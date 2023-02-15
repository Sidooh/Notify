import { CustomError } from './custom.err';

export class NotAuthorizedError extends CustomError {
    statusCode = 401;

    constructor() {
        super('Unauthorized!');

        Object.setPrototypeOf(this, NotAuthorizedError.prototype);
    }

    serializeErrors(): { message: string; field?: string }[] {
        return [{message: 'Unauthorized!!'}];
    }
}