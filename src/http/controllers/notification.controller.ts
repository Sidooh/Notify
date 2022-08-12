import { NextFunction, Request, Response } from 'express';
import { NotificationRequest } from '../requests/notification.request';
import { log } from '../../utils/logger';
import map from 'lodash/map';
import { Notification } from '../../models/Notification';
import { validate } from '../middleware/validate.middleware';
import { BadRequestError } from '../../exceptions/bad-request.err';
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
        const { with_notifiables } = query;

        try {
            const notifications = await Notification.find({
                relations: { notifiables: Boolean(with_notifiables) }, order: { id: 'DESC' },
                select   : ['id', 'event_type', 'content', 'channel', 'destination', 'status', 'created_at']
            });

            return res.send(this.successResponse({ data: notifications }));
        } catch (err) {
            log.error(err);
            throw new BadRequestError('Unable to fetch notifications!');
        }
    };

    #store = async ({ body }: Request, res: Response): Promise<Response | void> => {
        let { channel, destination, content, event_type } = body;

        const notifications = await NotificationRepository.store(channel, content, event_type, destination);

        return res.status(201).send(this.successResponse({ data: { ids: map(notifications, 'id') } }));
    };

    #show = async ({ params, query }: Request, res: Response) => {
        const { with_notifiables } = query;

        const notification = await Notification.findOne({
            where: { id: Number(params.id) }, relations: { notifiables: Boolean(with_notifiables) }
        });

        if (!notification) throw new NotFoundError('Notification Not Found!');

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
