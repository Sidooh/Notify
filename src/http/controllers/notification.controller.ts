import { Request, Response } from 'express';
import { NotificationRequest } from '../requests/notification.request';
import { validate } from '../middleware/validate.middleware';
import { NotFoundError } from '../../exceptions/not-found.err';
import Controller from './controller';
import NotificationRepository, { NotificationIndexBuilder } from '../../repositories/notification.repository';
import { Status } from '../../utils/enums';

export class NotificationController extends Controller {
    private repo: NotificationRepository;

    constructor() {
        super('/notifications');

        this.repo = new NotificationRepository();

        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}`, validate(NotificationRequest.index), this.#index);
        this.router.post(`${this.basePath}`, validate(NotificationRequest.store), this.#store);
        this.router.post(`${this.basePath}/:id/retry`, this.#retry);
        this.router.get(`${this.basePath}/:id`, this.#show);
    }

    #index = async ({ query }: Request, res: Response) => {
        let builder: NotificationIndexBuilder = {
            where        : {},
            withRelations: String(query.with)
        };

        if (query.channel) builder.where.channel = String(query.channel);

        const notifications = await this.repo.index(builder);

        return res.send(this.successResponse({ data: notifications }));
    };

    #store = async ({ body }: Request, res: Response): Promise<Response | void> => {
        let { channel, destination, content, event_type } = body;
        channel = channel.toUpperCase();
        event_type = event_type.toUpperCase();

        const notifications = await this.repo.notify(channel, content, event_type, destination);

        return res.status(201).send(this.successResponse({ data: { ids: notifications.map(n => n.id) } }));
    };

    #show = async ({ params, query }: Request, res: Response) => {
        const notification = await this.repo.find(Number(params.id), String(query.with));

        res.send(this.successResponse({ data: notification }));
    };

    #retry = async ({ params }: Request, res: Response) => {
        const id = Number(params.id);
        let notification = await this.repo.find(id);

        if (!notification) throw new NotFoundError('Notification Not Found!');

        if (notification.status !== Status.FAILED)
            return res.send(this.errorResponse({
                message: 'There is a problem with this notification - Status. Contact Support.'
            }));

        await this.repo.send(notification.channel, [notification]);

        res.send(this.successResponse({
            data: await this.repo.find(id, 'notifiables')
        }));
    };
}
