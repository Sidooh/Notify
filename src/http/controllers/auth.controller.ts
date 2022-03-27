import { Request, Response, Router } from 'express';
import ControllerInterface from '../../utils/interfaces/controller.interface';

export class AuthController implements ControllerInterface {
    path: string = '/auth';
    router: Router = Router();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.post(`${this.path}/login`, this.#login);
    }

    #login = async (req: Request, res: Response) => {
        const { email, password } = req.body;

        console.log(email, password);

        return res.send({ email, password });
    };
}
