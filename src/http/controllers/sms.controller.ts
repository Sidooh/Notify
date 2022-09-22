import { Request, Response } from 'express';
import { BadRequestError } from '../../exceptions/bad-request.err';
import Controller from './controller';
import { SMSProvider } from '../../models/SMSProvider';
import { validate } from '../middleware/validate.middleware';
import { SMSRequest } from '../requests/sms.request';
import { NotFoundError } from '../../exceptions/not-found.err';
import SmsRepository from '../../repositories/sms.repository';

export class SmsController extends Controller {
    constructor() {
        super('/sms');
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}`, this.#index);
        this.router.get(`${this.basePath}/providers`, this.#getProviders);
        this.router.post(`${this.basePath}/providers`, validate(SMSRequest.upsertProvider), this.#storeProvider);
        this.router.put(`${this.basePath}/providers/:id`, validate(SMSRequest.upsertProvider), this.#updateProvider);
        this.router.delete(`${this.basePath}/providers/:id`, this.#destroyProvider);
    }

    #index = async ({ query }: Request, res: Response) => {
        const { with_relations } = query;

        const notifications = await SmsRepository.index(String(with_relations));

        return res.send(this.successResponse({ data: notifications }));
    };

    #getProviders = async (req: Request, res: Response) => {
        res.send(this.successResponse({ data: await SMSProvider.find() }));
    };

    #storeProvider = async ({ body }: Request, res: Response) => {
        const { name, environment, priority } = body;

        const providers = await SMSProvider.find({ select: ['name', 'priority'] });

        if (providers.find(p => p.name === name)) throw new BadRequestError('Provider already exists!');
        if (providers.find(p => p.priority === priority)) throw new BadRequestError('Priority already taken!');

        const provider = await SMSProvider.save({ name, environment, priority });

        res.send(this.successResponse({ data: provider }));
    };

    #updateProvider = async ({ body, params }: Request, res: Response) => {
        const id = Number(params.id);
        const { name, environment, priority } = body;

        const providers = await SMSProvider.find({ select: ['id', 'name', 'priority'] });

        const provider = providers.find(p => Number(p.id) === id);

        if (!provider) throw new NotFoundError('Provider Not Found!');
        if (providers.find(p => p.priority === priority && Number(p.id) !== id))
            throw new BadRequestError('Priority already taken!');

        provider.name = name;
        provider.priority = priority;
        provider.environment = environment;

        await provider.save();

        res.send(this.successResponse({ data: provider }));
    };

    #destroyProvider = async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await SMSProvider.delete(Number(id));

        res.send(this.successResponse({ data: { message: result.affected ? 'Deleted!' : 'Nothing to delete' } }));
    };
}
