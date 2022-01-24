import { NextFunction, Request, Response, Router } from 'express';
import ControllerInterface from '@/utils/interfaces/controller.interface';
import validationMiddleware from '@/middleware/validation.middleware';
import HttpException from '@/utils/exceptions/http.exception';
import Mail from '@/services/mail';
import IMail from '@/services/mail/mail.interface';
import ISlack from '@/services/slack/slack.interface';
import Slack from '@/services/slack';
import SMS from '@/services/sms';
import NotificationService from './notification.service';
import { validateNotification } from '@/resources/notification/notification.validation';
import { INotification } from '@/models/interfaces';
import { Help } from '@/utils/helpers/helpers';

class NotificationController implements ControllerInterface {
    path: string = '/notifications';
    router: Router = Router();
    #service = new NotificationService();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}`, this.#index);
        this.router.post(`${this.path}`, validationMiddleware(validateNotification.create), this.#store);
        this.router.post(`${this.path}/retry`, validationMiddleware(validateNotification.retry), this.#retry);
        this.router.get(`${this.path}/:id`, this.#show);
    }

    #index = async (req: Request, res: Response) => {
        const notifications = await this.#service.fetchAll();

        return res.status(200).send(notifications);
    };

    #store = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { channel, destination, content, event_type } = req.body;
            const notification = await this.#service.create(channel, destination, content, event_type);

            if (!notification) next(new HttpException(500, 'Unable to send notification.'));

            await this.#send(notification, req.body);

            return res.status(201).send(notification);
        } catch (err: any) {
            next(new HttpException(400, err.message));
        }
    };

    #show = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params,
                notification = await this.#service.findOne(id);

            res.send(notification);
        } catch (err: any) {
            next(new HttpException(500, err.message));
        }
    };

    #retry = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notification: INotification = await this.#service.findOne(req.body.id);

            const isSuccessful = await this.#send(notification, notification, true);

            res.send({ status: isSuccessful ? 'success' : 'failed' });
        } catch (err: any) {
            next(new HttpException(500, err.message));
        }
    };

    #send = async (notification: INotification, channelData: IMail | ISlack, retry = false): Promise<void | boolean> => {
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

export default NotificationController;
