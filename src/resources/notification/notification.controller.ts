import {NextFunction, Request, Response, Router} from "express";
import Controller from "@/utils/interfaces/controller.interface";
import validationMiddleware from '@/middleware/validation.middleware'
import validate from '@/resources/notification/notification.validation'
import HttpException from "@/utils/exceptions/http.exception";
import NotificationService from "@/resources/notification/notification.service";
import Notification from "@/resources/notification/notification.interface";

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

            if(this.#send(notification)) return res.status(200).send(notification)
        } catch (e: any) {
            next(new HttpException(400, e.message))
        }
    }

    #send = (notification:Notification): boolean => {
        try {
            const {channel, to, content} = notification

            console.log(channel, to, content)

            return true
        } catch (e: any) {
            return false
        }
    }
}

export default NotificationController