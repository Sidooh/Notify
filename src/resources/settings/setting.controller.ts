import ControllerInterface from "@/utils/interfaces/controller.interface";
import {NextFunction, Request, Response, Router} from "express";
import validationMiddleware from "@/middleware/validation.middleware";
import {validateSetting} from "@/resources/settings/setting.validation";
import HttpException from "@/utils/exceptions/http.exception";
import SettingService from "@/resources/settings/setting.service";

export default class SettingController implements ControllerInterface {
    path: string = '/settings';
    router: Router = Router();
    #service = new SettingService()

    constructor() {
        this.#initRoutes()
    }

    #initRoutes(): void {
        this.router.get(`${this.path}`, this.#index)
        this.router.post(`${this.path}`, validationMiddleware(validateSetting.create), this.#tweak)
    }

    #index = async (req: Request, res: Response) => {
        const settings = await this.#service.index()

        res.send(settings)
    }

    #tweak = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const setting = await this.#service.tweak(req.body)

            res.send(setting)
        } catch (err: any) {
            next(new HttpException(400, err.message))
        }
    }
}
