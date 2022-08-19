import { Request, Response } from 'express';
import Controller from './controller';
import MailRepository from '../../repositories/mail.repository';

export class MailController extends Controller {
    constructor() {
        super('/mail');
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}`, this.#index);
    }

    #index = async({ query }:Request, res:Response) => {
        const { with_relations } = query;

        const notifications = await MailRepository.index(String(with_relations));

        return res.send(this.successResponse({ data: notifications }));
    }
}
