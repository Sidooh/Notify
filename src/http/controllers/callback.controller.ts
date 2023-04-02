import Controller from './controller';
import { CallbackRepository } from '../../repositories/callback.repository';
import { Request, Response } from 'express';
import { log } from '../../utils/logger';

export class CallbackController extends Controller {

    constructor(private repo = new CallbackRepository) {
        super('/callbacks');

        this.router.all(`${this.basePath}/wavesms`, this.#wavesms);
        this.router.all(`${this.basePath}/websms`, this.#websms);
        this.router.all(`${this.basePath}/africastalking`, this.#africastalking);
    }

    #wavesms = ({ body }: Request, res: Response) => {
        log.info('...[CB]: WAVESMS...', { body })

        if(body.description == 'DeliveredToTerminal') {
            this.repo.handleCompleted(body.messageid)
        } else {
            this.repo.handleFailed(body.messageid)
        }

        res.send()
    }

    #websms = ({ body }: Request, res: Response) => {
        log.info('...[CB]: WEBSMS...', { body })

        if(body.code == 0) {
            this.repo.handleCompleted(body.message_id)
        } else {
            this.repo.handleFailed(body.message_id)
        }

        res.send()
    }

    #africastalking = ({ body }: Request, res: Response) => {
        log.info('...[CB]: AFRICASTALKING...', { body })

        if(body.status == 'Success') {
            this.repo.handleCompleted(body.id)
        } else {
            this.repo.handleFailed(body.id)
        }

        res.send()
    }
}
