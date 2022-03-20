import { NextFunction, Request, Response, Router } from 'express';
import { BadRequestError, NotFoundError } from '@nabz.tickets/common';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import Slack from '../../channels/slack';
import SMS from '../../channels/sms';
import { Notification, NotificationDoc } from '../../models/notification.model';
import { NotificationRequest } from '../requests/notification.request';
import { log } from '../../utils/logger';
import HttpException from '@nabz.tickets/common/build/exceptions/http.exception';
import { Mail } from '../../channels/mail';
import { Setting } from '../../models/setting.model';

export class NotificationController implements ControllerInterface {
    path: string = '/notifications';
    router: Router = Router();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}`, this.#index);
        this.router.post(`${this.path}`, ValidationMiddleware(NotificationRequest.store), this.#store);
        this.router.post(`${this.path}/retry`, ValidationMiddleware(NotificationRequest.retry), this.#retry);
        this.router.get(`${this.path}/:id`, this.#show);
    }

    #index = async (req: Request, res: Response) => {
        try {
            const notifications = await Notification.find({})
                .select(['id', 'destination', 'channel', 'event_type', 'content', 'provider', 'status', 'created_at', 'notifiable_type'])
                .sort('-_id').populate('notifiable_id', ['data']);

            return res.send(notifications);
        } catch (err) {
            log.error(err);
            throw new BadRequestError('Unable to fetch notifications!');
        }
    };

    #store = async (req: Request, res: Response): Promise<Response | void> => {
        let { channel, destination, content, event_type } = req.body;

        log.info(`CREATE ${channel} NOTIFICATION: for ${event_type}`);

        if (channel === 'slack') destination = 'Sidooh';

        const notification = await Notification.create({ channel, destination, content, event_type });

        this.send(notification, req.body);

        return res.status(201).send(notification);
    };

    #show = async (req: Request, res: Response) => {
        const notification = await Notification.findById(req.params.id).populate('notifiable_id', ['data']);

        if (!notification) throw new NotFoundError();

        res.send(notification);
    };

    #retry = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notification = await Notification.findById(req.body.id).populate('notifiable_id', ['data']);

            const isSuccessful = await this.send(notification as NotificationDoc, notification, true);

            res.send({ status: isSuccessful ? 'success' : 'failed' });
        } catch (err: any) {
            next(new HttpException(500, err.message));
        }
    };

    send = async (notification: NotificationDoc, channelData: any, retry = false): Promise<void | boolean> => {
        log.info(`SEND ${notification.channel} NOTIFICATION to ${notification.destination}`);

        let providerResponse;
        if (notification.channel === 'mail') {
            providerResponse = await new Mail(notification).send();
        } else if (notification.channel === 'sms') {
            const settings = await Setting.find({ types: ['default_sms_provider', 'websms_env', 'africastalking_env'] });

            providerResponse = await new SMS(notification, settings).send(retry);
        } else {
            providerResponse = await new Slack(channelData, notification).send();
        }

        if (retry) return providerResponse;
    };
}
