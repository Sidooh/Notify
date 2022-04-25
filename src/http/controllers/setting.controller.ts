import { Request, Response, Router } from 'express';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { SettingRequest } from '../requests/setting.request';
import { log } from '../../utils/logger';
import { Setting } from '../../models/Setting';
import { validate } from '../middleware/validate.middleware';

export class SettingController implements ControllerInterface {
    path: string = '/settings';
    router: Router = Router();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}`, this.#index);
        this.router.post(`${this.path}`, validate(SettingRequest.create), this.#tweak);
        this.router.delete(`${this.path}/:id`, this.#destroy);
    }

    #index = async (req: Request, res: Response) => {
        const settings = await Setting.find();

        res.send(settings);
    };

    #tweak = async ({ body }: Request, res: Response) => {
        log.info('Tweak Settings - ', body);

        const { type, value } = body;

        let setting = await Setting.findOneBy({type})

        if(!setting) {
            setting = await Setting.create({type, value}).save()
        } else {
            setting.type = type;
            setting.value = value
            await setting.save()
        }

        res.send(setting);
    };

    #destroy = async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await Setting.delete(Number(id));

        res.send({ message: result.affected ? 'Deleted!' : 'Nothing to delete' });
    };
}
