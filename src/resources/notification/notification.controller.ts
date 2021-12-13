import {NextFunction, Request, Response, Router} from "express";
import Controller from "@/utils/interfaces/controller.interface";
import validationMiddleware from '@/middleware/validation.middleware'
import validate from '@/resources/notification/notification.validation'
import HttpException from "@/utils/exceptions/http.exception";
import NotificationService from "@/resources/notification/notification.service";

class NotificationController implements Controller {
    path: string = '/notifications';
    router: Router = Router();
    #NotificationService = new NotificationService()

    constructor() {
        this.#initRoutes()
    }

    #initRoutes(): void {
        this.router.post(`${this.path}`, validationMiddleware(validate.create), this.#create)
    }

    #create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const {title, body} = req.body

            const post = await this.#NotificationService.create(title, body)

            res.status(201).json({post})
        } catch (e: any) {
            next(new HttpException(400, e.message))
        }
    }
}

export default NotificationController