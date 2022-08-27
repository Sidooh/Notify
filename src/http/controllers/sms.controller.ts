import { Request, Response } from 'express';
import { Help } from '../../utils/helpers';
import ATService from '../../channels/sms/AT/AT.service';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';
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
        this.router.get(`${this.basePath}/balances`, this.#balance);
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

    #balance = async (req: Request, res: Response) => {
        const settings = await Help.getSMSSettings();

        if (!settings.default_provider) throw new BadRequestError('Default provider not set!');

        const balances = {
            websms        : Number((await new WebSMSService(settings.websms_env).balance()).match(/-?\d+\.*\d*/g)[0]),
            africastalking: Number((await new ATService(settings.africastalking_env).balance()).match(/-?\d+\.*\d*/g)[0])
        };

        return res.send(this.successResponse({ data: { default_provider: settings.default_provider, balances } }));
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
