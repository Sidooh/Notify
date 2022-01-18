import {NextFunction, Request, Response, Router} from "express";
import ControllerInterface from "@/utils/interfaces/controller.interface";
import validationMiddleware from '@/middleware/validation.middleware'
import HttpException from "@/utils/exceptions/http.exception";
import Mail from "@/services/mail";
import IMail from "@/services/mail/mail.interface";
import ISlack from "@/services/slack/slack.interface";
import Slack from "@/services/slack";
import SMS from "@/services/sms";
import NotificationService from "./notification.service";
import {validateNotification} from "@/resources/notification/notification.validation";
import {INotification} from "@/models/interfaces";
import {Help} from "@/utils/helpers/helpers";

class NotificationController implements ControllerInterface {
    path: string = '/notifications';
    router: Router = Router();
    #service = new NotificationService()

    constructor() {
        this.#initRoutes()
    }

    #initRoutes(): void {
        this.router.post(`${this.path}`, validationMiddleware(validateNotification.create), this.#store)
    }

    #store = async (req: Request, res: Response, next: NextFunction): Promise<Response|void> => {
        try {
            const {channel, destination, content, event_type} = req.body
            const notification = await this.#service.create(channel, destination, content, event_type)

            if (!notification) next(new HttpException(500, 'Unable to send notification.'))

            await this.#send(notification, req.body)

            return res.status(200).send(notification)
        } catch (e: any) {
            next(new HttpException(400, e.message))
        }
    }

    #send = async (notification: INotification, channelData: IMail|ISlack): Promise<void> => {
        if (notification.channel === 'mail') {
            await new Mail(notification).send()
        } else if(notification.channel === 'sms') {
            const smsProvider = await Help.getSetting('default_sms_provider')

            await new SMS(notification, smsProvider).send()
        } else {
            await new Slack(channelData as ISlack, notification).send()
        }
    }
}

export default NotificationController
