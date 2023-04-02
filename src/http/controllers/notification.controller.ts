import { Request, Response } from 'express';
import { NotificationRequest } from '../requests/notification.request';
import { validate } from '../middleware/validate.middleware';
import Controller from './controller';
import NotificationRepository, { NotificationIndexBuilder } from '../../repositories/notification.repository';
import { Status } from '../../utils/enums';
import { Notification as NotificationType } from '@prisma/client';

export class NotificationController extends Controller {
    private repo: NotificationRepository;

    constructor() {
        super('/notifications');

        this.repo = new NotificationRepository();

        //  Initialize routes
        this.router.get(`${this.basePath}`, validate(NotificationRequest.index), this.#index);
        this.router.post(`${this.basePath}`, validate(NotificationRequest.store), this.#store);
        this.router.post(`${this.basePath}/:notification/retry`, validate(NotificationRequest.retry), this.#retry);
        this.router.get(`${this.basePath}/:id`, this.#show);
        this.router.post(`${this.basePath}/:notification/check-notification`, validate(NotificationRequest.checkNotification), this.#checkNotification);
    }

    #index = async ({ query }: Request, res: Response) => {
        let builder: NotificationIndexBuilder = {
            where        : {},
            withRelations: String(query.with)
        };

        if (query.channel) builder.where!.channel = String(query.channel);

        const notifications = await this.repo.index(builder);

        return res.send(this.successResponse(notifications));
    };

    #store = async ({ body }: Request, res: Response): Promise<Response | void> => {
        let { channel, destination, content, event_type } = body;
        channel = channel.toUpperCase();
        event_type = event_type.toUpperCase();

        const notifications = await this.repo.notify(channel, content, event_type, destination);

        return res.status(201).send(this.successResponse({ ids: notifications.map(n => n.id) }));
    };

    #show = async ({ params, query }: Request, res: Response) => {
        const notification = await this.repo.find(Number(params.id), String(query.with));

        res.send(this.successResponse(notification));
    };

    #retry = async ({ params }: Request, res: Response) => {
        let notification = params.notification as unknown as NotificationType;

        if (notification.status !== Status.FAILED)
            return res.send(this.errorResponse({
                message: 'There is a problem with this notification - Status. Contact Support.'
            }));

        await this.repo.send(notification.channel, [notification]);

        res.send(this.successResponse(await this.repo.find(notification.id, 'notifiables')));
    };

    #checkNotification = async ({ params }: Request, res: Response) => {
        let notification = params.notification as unknown as NotificationType;

        // Check notification is PENDING ...
        if (notification.status !== Status.PENDING) {
            return res.send(this.errorResponse({ message: 'There is a problem with this notification. Status. Contact Support.' }));
        }

        notification = await this.repo.checkNotification(notification);

        res.send(this.successResponse(notification));
    };
}
