import { Request, Response } from 'express';
import { SettingRequest } from '../requests/setting.request';
import { log } from '../../utils/logger';
import { Setting } from '../../models/Setting';
import { validate } from '../middleware/validate.middleware';
import Controller from './controller';

export class SettingController extends Controller {
    constructor() {
        super('/settings');
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}`, this.#index);
        this.router.post(`${this.basePath}`, validate(SettingRequest.create), this.#tweak);
        this.router.delete(`${this.basePath}/:id`, this.#destroy);
    }

    #index = async (req: Request, res: Response) => {
        const settings = await Setting.find();

        res.send(this.successResponse({ data: settings }));
    };

    #tweak = async ({ body }: Request, res: Response) => {
        log.info('Tweak Settings - ', body);

        let { key, value } = body;

        let setting = await Setting.findOneBy({ key });

        if (!setting) {
            setting = await Setting.save({ key, value: { data: value } });
        } else {
            setting.key = key;
            setting.value = { data: value };
            await setting.save();
        }

        res.send(this.successResponse({ data: setting }));
    };

    #destroy = async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await Setting.delete(Number(id));

        res.send(this.successResponse({ data: { message: result.affected ? 'Deleted!' : 'Nothing to delete' } }));
    };
}
