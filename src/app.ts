import express, { Express, json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@nabz.tickets/common';
import { NotificationController, SettingController } from './http/controllers';
import { log } from './utils/logger';
import ControllerInterface from './utils/interfaces/controller.interface';
import { SmsController } from './http/controllers/sms.controller';
import { DashboardController } from './http/controllers/dashboard.controller';

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
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
        this.app.use(cookieSession({
            signed: false,
            secure: process.env.NODE_ENV !== 'test'
        }));
    }

    #initControllers(): void {
        [
            new NotificationController(),
            new SettingController(),
            new SmsController(),
            new DashboardController()
        ].forEach((controller: ControllerInterface) => this.app.use('/api', controller.router));

        this.app.all('*', async () => {
            throw new NotFoundError();
        });
    }

    #initErrorHandling(): void {
        this.app.use(errorHandler);
    }

    listen(): void {
        this.app.listen(this.port, () => log.info(`App listening on port: ${this.port}`))
            .on('error', (err) => log.error('Startup error: ', err));
    }
}

export default App;
