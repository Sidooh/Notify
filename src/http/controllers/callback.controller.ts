import Controller from './controller';
import { CallbackRepository } from '../../repositories/callback.repository';
import { Request, Response } from 'express';

export class CallbackController extends Controller {

    constructor(private repo = new CallbackRepository) {
        super('/callbacks');

        this.router.all(`${this.basePath}/wavesms`, this.#wavesms);
        this.router.all(`${this.basePath}/websms`, this.#websms);
    }

    #wavesms = ({ body }: Request, res: Response) => {
        if(body['response-code'] == 200) {
            this.repo.handleCompleted(body['message-id'])
        } else {
            this.repo.handleFailed(body['message-id'])
        }

        res.send()
    }

    #websms = (req: Request, res: Response) => {
        // this.repo
    }
}
