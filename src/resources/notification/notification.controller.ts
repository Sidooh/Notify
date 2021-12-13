import {NextFunction, Request, Response, Router} from "express";
import Controller from "@/utils/interfaces/controller.interface";
import validationMiddleware from '@/middleware/validation.middleware'
import validate from '@/resources/notification/notification.validation'
import HttpException from "@/utils/exceptions/http.exception";
import NotificationService from "@/resources/notification/notification.service";
import INotification from "@/resources/notification/notification.interface";
import Mail from "@/services/mail/mail";

class NotificationController implements Controller {
    path: string = '/notifications';
    router: Router = Router();
    #NotificationService = new NotificationService()

    constructor() {
        this.#initRoutes()
    }

    #initRoutes(): void {
        this.router.post(`${this.path}`, validationMiddleware(validate.create), this.#store)
    }

    #store = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const {channel, to, content} = req.body

            const notification = await this.#NotificationService.create(channel, to, content)

            if(!notification) {
                next(new HttpException(500, 'Unable to send notification.'))
            }

            if(await this.#send(notification)) return res.status(200).send(notification)
        } catch (e: any) {
            next(new HttpException(400, e.message))
        }
    }

    #send = async (notification: INotification): Promise<boolean> => {
        try {
            const {channel, to, content} = notification

            if (channel === 'email') {
                await new Mail(notification).send()
            }

            return true
        } catch (e: any) {
            return false
        }
    }
}

export default NotificationController