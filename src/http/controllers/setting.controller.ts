import { Request, Response } from 'express';
import { SettingRequest } from '../requests/setting.request';
import { log } from '../../utils/logger';
import { validate } from '../middleware/validate.middleware';
import Controller from './controller';
import { SettingRepository } from '../../repositories/setting.repository';
import { HttpStatusCode } from 'axios';
import { Setting } from '@prisma/client';

export class SettingController extends Controller {
    private repo: SettingRepository;

    constructor() {
        super('/settings');

        this.repo = new SettingRepository();

        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}`, this.#index);
        this.router.post(`${this.basePath}`, validate(SettingRequest.upsert), this.#tweak);
        this.router.delete(`${this.basePath}/:setting`, validate(SettingRequest.destroy), this.#destroy);
    }

    #index = async (req: Request, res: Response) => {
        const settings = await this.repo.findMany();

        res.json(this.successResponse({ data: settings }));
    };

    #tweak = async ({ body }: Request, res: Response) => {
        log.info('Tweak Setting - ', body);

        let { key, value } = body;

        const setting = await this.repo.tweak(key, value);

        res.send(this.successResponse({ data: setting }));
    };

    #destroy = async ({ params }: Request, res: Response) => {
        const setting = params.setting as unknown as Setting;

        await this.repo.destroy(Number(setting.id));

        res.status(HttpStatusCode.NoContent).send();
    };
}
