import { Request, Response } from 'express';
import { BadRequestError } from '../../exceptions/bad-request.err';
import Controller from './controller';
import { validate } from '../middleware/validate.middleware';
import { SmsProviderRequest } from '../requests/sms-provider.request';
import { SmsProviderRepository } from '../../repositories/sms-provider.repository';
import { HttpStatusCode } from 'axios';

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
        this.router.put(`${this.basePath}/:id`, validate(SmsProviderRequest.update), this.#update);
        this.router.delete(`${this.basePath}/:id`, this.#destroy);
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
        const id = Number(params.id);
        const { name, environment, priority } = body;

        const providers = await this.repo.findMany({ select: { id: true, name: true, priority: true } });

        if (providers.find(p => p.priority === priority && Number(p.id) !== id))
            throw new BadRequestError('Priority already taken!');

        const provider = await this.repo.update({ name, priority, environment }, { id });

        res.send(this.successResponse({ data: provider }));
    };

    #destroy = async (req: Request, res: Response) => {
        const { id } = req.params;

        await this.repo.destroy(Number(id));

        res.status(HttpStatusCode.NoContent).send();
    };
}
