import express, { Express, json, urlencoded } from 'express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { log } from '@/utils/logger';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import IController from '@/utils/interfaces/controller.interface';
import { NotificationController, SettingController } from '@/http/controllers';
import { errorHandler, NotFoundError } from '@nabz.tickets/common';

class App {
    public app: Express;
    public port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;

        this.#initMiddleware();
        this.#initControllers();
        this.#initErrorHandling();
    }

    #initMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(morgan('dev'));
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
        this.app.use(cookieSession({
            signed: false,
            secure: process.env.NODE_ENV !== 'test'
        }))
        this.app.use(compression());
    }

    #initControllers(): void {
        [
            new NotificationController(),
            new SettingController()
        ].forEach((controller: IController) => this.app.use('/api', controller.router));

        this.app.all('*', async () => {
            throw new NotFoundError();
        })
    }

    #initErrorHandling(): void {
        this.app.use(errorHandler);
    }

    listen(): void {
        this.app.listen(this.port, () => log.info(`App listening on port: ${this.port}`));
    }
}

export default App;
