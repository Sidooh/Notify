import { NextFunction, Request, Response, Router } from 'express';
import ControllerInterface from '@/utils/interfaces/controller.interface';
import validationMiddleware from '@/http/middleware/validation.middleware';
import HttpException from '@/utils/exceptions/http.exception';
import Mail from '@/channels/mail';
import IMail from '@/channels/mail/mail.interface';
import ISlack from '@/channels/slack/slack.interface';
import Slack from '@/channels/slack';
import SMS from '@/channels/sms';
import NotificationService from '../services/notification.service';
import { NotificationRequest } from '@/http/requests/notification.request';
import { Help } from '@/utils/helpers/helpers';
import { NotFoundError } from '@nabz.tickets/common';
import { Notification, NotificationDoc } from '@/models/notification.model';
import { log } from '@/utils/logger';

export class NotificationController implements ControllerInterface {
    path: string = '/notifications';
    router: Router = Router();
    #service = new NotificationService();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}`, this.#index);
        this.router.post(`${this.path}`, validationMiddleware(NotificationRequest.store), this.#store);
        this.router.post(`${this.path}/retry`, validationMiddleware(NotificationRequest.retry), this.#retry);
        this.router.get(`${this.path}/:id`, this.#show);
    }

    #index = async (req: Request, res: Response) => {
        const notifications = await this.#service.fetchAll();

        return res.status(200).send(notifications);
    };

    #store = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { channel, destination, content, event_type } = req.body;
        const notification = await this.#service.create(channel, destination, content, event_type);

        await this.#send(notification, req.body);

        return res.status(201).send(notification);
    };

    #show = async (req: Request, res: Response) => {
        const notification = await Notification.findById(req.params.id).populate('notifiable_id', ['data']);

        if (!notification) throw new NotFoundError();

        res.send(notification);
    };

    #retry = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notification = await this.#service.findOne(req.body.id);

            const isSuccessful = await this.#send(notification, notification, true);

            res.send({ status: isSuccessful ? 'success' : 'failed' });
        } catch (err: any) {
            next(new HttpException(500, err.message));
        }
    };

    #send = async (notification: NotificationDoc, channelData: IMail | ISlack, retry = false): Promise<void | boolean> => {
        log.info(`SEND ${notification.channel} NOTIFICATION to ${notification.destination}`);

        let providerResponse;
        if (notification.channel === 'mail') {
            providerResponse = await new Mail(notification).send();
        } else if (notification.channel === 'sms') {
            const smsProvider = await Help.getSetting('default_sms_provider');

            providerResponse = await new SMS(notification, smsProvider).send(retry);
        } else {
            providerResponse = await new Slack(channelData as ISlack, notification).send();
        }

        if (retry) return providerResponse;
    };
}
