import { NextFunction, Request, Response, Router } from 'express';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import db from '../../../models';
import { SettingRequest } from '../requests/setting.request';
import { ValidationMiddleware } from '../middleware/validation.middleware';

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
        const settings = await db.Setting.findAll();

        res.send(settings);
    };

    #tweak = async (req: Request, res: Response, next: NextFunction) => {
        const { id, type, value } = req.body;

        const [setting] = await db.Setting.upsert({ id, type, value });

        res.send(setting);
    };

    #destroy = async (req: Request, res: Response) => {
        const { id } = req.params;

        await db.Setting.destroy({ where: { id } });

        res.send({ message: 'Deleted!' });
    };
}
