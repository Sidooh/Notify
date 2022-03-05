import { CustomError } from '@nabz.tickets/common';
import { ValidationErrorItem } from 'joi';

export class RequestValidationError extends CustomError {
    statusCode = 400

    constructor(public errors: ValidationErrorItem[]) {
        super('Invalid request!');

        //  Only because we are extending a built-in class
        Object.setPrototypeOf(this, RequestValidationError.prototype)
    }

    serializeErrors = () => {
        return this.errors.map(error => ({message: error.message, field: String(error.path)}))
    }
}