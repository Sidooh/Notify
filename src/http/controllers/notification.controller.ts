import { NextFunction, Request, Response, Router } from 'express';
import { BadRequestError, NotFoundError } from '@nabz.tickets/common';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { NotificationRequest } from '../requests/notification.request';
import { log } from '../../utils/logger';
import HttpException from '@nabz.tickets/common/build/exceptions/http.exception';
import map from 'lodash/map';
import { Channel } from '../../utils/enums';
import { Notification } from '../../models/Notification';
import { Setting } from '../../models/Setting';
import { In } from 'typeorm';
import SMS from '../../channels/sms';

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
            const notifications = await Notification.find({
                // attributes: { exclude: ['updatedAt'] }, order: [['id', 'DESC']],
                // include   : [ATCallback, WebsmsCallback]
            });

            return res.send(notifications);
        } catch (err) {
            log.error(err);
            throw new BadRequestError('Unable to fetch notifications!');
        }
    };

    #store = async (req: Request, res: Response): Promise<Response | void> => {
        let { channel, destination, content, event_type } = req.body;

        log.info(`CREATE ${channel} NOTIFICATION: for ${event_type}`);

        if (channel === Channel.SLACK) destination = 'Sidooh';

        const notifications = Notification.create(destination.map((destination: number | string) => ({
            channel, destination, content, event_type
        })));
        await Notification.insert(notifications);

        /*  TODO: Remove the await after dev    */
        await this.send(notifications, req.body);

        return res.status(201).send(notifications);
    };

    send = async (notifications: Notification[], channelData: any, retry = false): Promise<void | boolean> => {
        const channel = notifications[0].channel;
        const destinations = map(notifications, 'destination');

        log.info(`SEND ${channel} NOTIFICATION to ${destinations.join(',')}`);

        let channelSrv;
        if (channel === Channel.MAIL) {
            // channelSrv = new Mail(notifications);
        } else if (channel === Channel.SMS) {
            const settings = await Setting.findBy({ type: In(['default_sms_provider', 'websms_env', 'africastalking_env']) });

            channelSrv = new SMS(notifications, destinations, settings);
        } else {
            // channelSrv = new Slack(channelData, notifications);
        }

        await channelSrv.send();
    };

    #show = async (req: Request, res: Response) => {
        const notification = await Notification.findOne({
            // where: { id: Number(req.params.id) }, include: [db.ATCallback, db.WebsmsCallback]
        });

        if (!notification) throw new NotFoundError();

        res.send(notification);
    };

    #retry = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notification = await Notification.find(req.body.id)/*.populate('notifiable_id', ['data'])*/;

            // const isSuccessful = await this.send([notification], notification, true);

            // res.send({ status: isSuccessful ? 'success' : 'failed' });
        } catch (err: any) {
            next(new HttpException(500, err.message));
        }
    };
}
