import { NextFunction, Request, Response } from 'express';
import { NotificationRequest } from '../requests/notification.request';
import { Notification } from '../../models/Notification';
import { validate } from '../middleware/validate.middleware';
import { NotFoundError } from '../../exceptions/not-found.err';
import Controller from './controller';
import NotificationRepository from '../../repositories/notification.repository';
import { Status } from '../../utils/enums';

export class NotificationController extends Controller {
    constructor() {
        super('/notifications');
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}`, this.#index);
        this.router.post(`${this.basePath}`, validate(NotificationRequest.store), this.#store);
        this.router.post(`${this.basePath}/:id/retry`, this.#retry);
        this.router.get(`${this.basePath}/:id`, this.#show);
    }

    #index = async ({ query }: Request, res: Response) => {
        const { with_relations } = query;

        const notifications = await NotificationRepository.index(String(with_relations));

        return res.send(this.successResponse({ data: notifications }));
    };

    #store = async ({ body }: Request, res: Response): Promise<Response | void> => {
        let { channel, destination, content, event_type } = body;
        channel = channel.toUpperCase()
        event_type = event_type.toUpperCase()

        const notifications = await NotificationRepository.store(channel, content, event_type, destination);

        return res.status(201).send(this.successResponse({ data: { ids: notifications.map(n => n.id) } }));
    };

    #show = async ({ params, query }: Request, res: Response) => {
        const notification = await NotificationRepository.show(Number(params.id), String(query.with));

        res.send(this.successResponse({ data: notification }));
    };

    #retry = async ({ params }: Request, res: Response, next: NextFunction) => {
        const id = Number(params.id);
        let notification = await Notification.findOne({ where: { id } });

        if (!notification) throw new NotFoundError('Notification Not Found!');

        if (notification.status !== Status.FAILED)
            return res.send(this.errorResponse({
                message: 'There is a problem with this notification - Status. Contact Support.'
            }));

        await NotificationRepository.send(notification.channel, [notification]);

        res.send(this.successResponse({
            data: await Notification.findOne({ where: { id }, relations: { notifiables: true } })
        }));
    };
}
