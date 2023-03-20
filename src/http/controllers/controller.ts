import { Router } from 'express';

export default class Controller {
    basePath: string;
    router: Router = Router();

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    protected successResponse(data) {
        return {
            result: 1,
            data
        };
    }

    protected errorResponse({ message, errors }: { message: string, errors?: string | string[] }) {
        let response: { result: number, message?: string, errors?: { message: string; }[] } = {
            result: 0
        };

        if (message) response.message = message;
        if (errors) response.errors = Array.isArray(errors) ? errors.map(e => ({ message: e })) : [{ message: errors }];

        return response;
    }
}
