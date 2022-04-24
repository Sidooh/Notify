import { NextFunction, Request, Response, Router } from 'express';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { NotificationRequest } from '../requests/notification.request';
import { log } from '../../utils/logger';
import map from 'lodash/map';
import { Channel } from '../../utils/enums';
import { Notification } from '../../models/Notification';
import { Setting } from '../../models/Setting';
import { In } from 'typeorm';
import SMS from '../../channels/sms';
import Slack from '../../channels/slack';
import { Mail } from '../../channels/mail';
import { validate } from '../middleware/validate.middleware';
import { BadRequestError } from '../../exceptions/bad-request.err';
import { NotFoundError } from '../../exceptions/not-found.err';

export class NotificationController implements ControllerInterface {
    path: string = '/notifications';
    router: Router = Router();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}`, this.#index);
        this.router.post(`${this.path}`, validate(NotificationRequest.store), this.#store);
        this.router.post(`${this.path}/retry/:id`, validate(NotificationRequest.retry), this.#retry);
        this.router.get(`${this.path}/:id`, this.#show);
    }

    #index = async (req: Request, res: Response) => {
        try {
            const notifications = await Notification.find({
                relations: { notifiables: true }, order: { id: 'DESC' },
                select   : ['id', 'event_type', 'content', 'channel', 'destination', 'status', 'created_at']
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

        if (channel === Channel.SLACK) destination = ['Sidooh'];

        const notifications = Notification.create(destination.map((destination: number | string) => ({
            channel, destination, content, event_type
        })));
        await Notification.insert(notifications);

        this.send(notifications, req.body);

        return res.status(201).send({ids: map(notifications, 'id')});
    };

    send = async (notifications: Notification[], channelData: any): Promise<void | boolean> => {
        const channel = notifications[0].channel;
        const destinations = map(notifications, 'destination');

        log.info(`SEND ${channel} NOTIFICATION to ${destinations.join(',')}`);

        let channelSrv;
        if (channel === Channel.MAIL) {
            channelSrv = new Mail(notifications);
        } else if (channel === Channel.SMS) {
            const settings = await Setting.findBy({ type: In(['default_sms_provider', 'websms_env', 'africastalking_env']) });

            channelSrv = new SMS(notifications, destinations, settings);
        } else {
            channelSrv = new Slack(channelData, notifications);
        }

        await channelSrv.send();
    };

    #show = async (req: Request, res: Response) => {
        const notification = await Notification.findOne({
            where: { id: Number(req.params.id) }, relations: { notifiables: true }
        });

        if (!notification) throw new NotFoundError();

        res.send(notification);
    };

    #retry = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notification = await Notification.findOne({
                where: { id: Number(req.body.id) }, relations: { notifiables: true }
            });

            this.send([notification], notification);

            res.send({ message: 'retrying...' });
        } catch (err: any) {
            next();
        }
    };
}
