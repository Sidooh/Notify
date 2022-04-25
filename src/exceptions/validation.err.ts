import { CustomError } from './custom.err';
import { ValidationErrorItem } from 'joi';

export class ValidationError extends CustomError {
    statusCode = 400;

    constructor(public errors: ValidationErrorItem[]) {
        super('Invalid request!');

        //  Only because we are extending a built-in class
        Object.setPrototypeOf(this, ValidationError.prototype);
    }

    serializeErrors = () => {
        return this.errors.map(error => ({message: error.message, field: String(error.path)}));
    };
}