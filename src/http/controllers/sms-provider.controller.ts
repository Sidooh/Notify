import { Request, Response } from 'express';
import Controller from './controller';
import { validate } from '../middleware/validate.middleware';
import { SmsProviderRequest } from '../requests/sms-provider.request';
import { SmsProviderRepository } from '../../repositories/sms-provider.repository';
import { HttpStatusCode } from 'axios';
import { SmsProvider } from '@prisma/client';

export class SmsProviderController extends Controller {
    private repo: SmsProviderRepository;

    constructor() {
        super('/sms-providers');

        this.repo = new SmsProviderRepository;

        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}`, this.#index);
        this.router.post(`${this.basePath}`, validate(SmsProviderRequest.store), this.#store);
        this.router.put(`${this.basePath}/:provider`, validate(SmsProviderRequest.update), this.#update);
        this.router.delete(`${this.basePath}/:provider`, validate(SmsProviderRequest.destroy), this.#destroy);
    }

    #index = async (req: Request, res: Response) => {
        const providers = await this.repo.findMany();

        res.send(this.successResponse({ data: providers }));
    };

    #store = async ({ body }: Request, res: Response) => {
        const { name, environment, priority } = body;

        const provider = await this.repo.create({ name, environment, priority });

        res.send(this.successResponse({ data: provider }));
    };

    #update = async ({ body, params }: Request, res: Response) => {
        let provider = params.provider as unknown as SmsProvider;
        const { name, environment, priority } = body;

        if (name || environment) {
            provider = await this.repo.update({ name, environment }, { id: provider.id });
        }

        if (priority !== provider.priority) {
            provider = await this.repo.updatePriority(provider.id, provider.priority, priority) as SmsProvider;
        }

        res.send(this.successResponse({ data: provider }));
    };

    #destroy = async ({ params }: Request, res: Response) => {
        const provider = params.provider as unknown as SmsProvider;

        await this.repo.destroy(provider.id);

        res.status(HttpStatusCode.NoContent).send();
    };
}
