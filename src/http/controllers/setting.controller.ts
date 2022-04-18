import { Request, Response, Router } from 'express';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { SettingRequest } from '../requests/setting.request';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { log } from '../../utils/logger';
import { Setting } from '../../models/Setting';

export class SettingController implements ControllerInterface {
    path: string = '/settings';
    router: Router = Router();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}`, this.#index);
        this.router.post(`${this.path}`, ValidationMiddleware(SettingRequest.create), this.#tweak);
        this.router.delete(`${this.path}/:id`, this.#destroy);
    }

    #index = async (req: Request, res: Response) => {
        const settings = await Setting.find();

        res.send(settings);
    };

    #tweak = async ({ body }: Request, res: Response) => {
        log.info('Tweak Settings - ', body);

        const { id, type, value } = body;

        await Setting.upsert({ id, type, value }, ['type']);
        const setting = await Setting.findOneBy({ type });

        res.send(setting);
    };

    #destroy = async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await Setting.delete(Number(id));

        res.send({ message: result.affected ? 'Deleted!' : 'Nothing to delete' });
    };
}
