import {NextFunction, Request, Response, Router} from "express";
import ControllerInterface from "@/utils/interfaces/controller.interface";
import validationMiddleware from '@/middleware/validation.middleware'
import validate from '@/resources/notification/notification.validation'
import HttpException from "@/utils/exceptions/http.exception";
import NotificationService from "@/resources/notification/notification.service";
import INotification from "@/resources/notification/notification.interface";
import Mail from "@/services/mail";
import IMail from "@/services/mail/mail.interface";
import ISlack from "@/services/slack/slack.interface";
import Slack from "@/services/slack";

class NotificationController implements ControllerInterface {
    path: string = '/notifications';
    router: Router = Router();
    #NotificationService = new NotificationService()

    constructor() {
        this.#initRoutes()
    }

    #initRoutes(): void {
        this.router.post(`${this.path}`, validationMiddleware(validate.create), this.#store)
    }

    #store = async (req: Request, res: Response, next: NextFunction): Promise<Response|void> => {
        try {
            const {channel, destination, content} = req.body

            const notification = await this.#NotificationService.create(channel, destination, content)

            if (!notification) {
                next(new HttpException(500, 'Unable to send notification.'))
            }

            await this.#send(notification, req.body)

            return res.status(200).send(notification)
        } catch (e: any) {
            next(new HttpException(400, e.message))
        }
    }

    #send = async (notification: INotification, channelData: IMail|ISlack): Promise<void> => {
        if (notification.channel === 'mail') {
            await new Mail(channelData as IMail, notification).send()
        } else {
            await new Slack(channelData as ISlack, notification).send()
        }
    }
}

export default NotificationController