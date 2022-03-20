import { NextFunction, Request, Response, Router } from 'express';
import { BadRequestError } from '@nabz.tickets/common';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { Setting } from '../../models/setting.model';
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
        const settings = await Setting.find({});

        res.send(settings);
    };

    #tweak = async (req: Request, res: Response, next: NextFunction) => {
        const { type, value } = req.body;

        await Setting.updateOne({ type: req.body.type }, { type, value }, { upsert: true });

        const updatedSetting = await Setting.findOne({ type });

        if (!updatedSetting) throw new BadRequestError('Updated setting not found!');

        res.send(updatedSetting);
    };

    #destroy = async (req: Request, res: Response) => {
        const { id } = req.params;

        await Setting.deleteOne({ _id: id });

        res.send({id});
    };
}
