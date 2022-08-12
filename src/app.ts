import express, { Application, json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import { log } from './utils/logger';
import { NotificationController, SettingController } from './http/controllers';
import { SmsController } from './http/controllers/sms.controller';
import { DashboardController } from './http/controllers/dashboard.controller';
import { ErrorMiddleware } from './http/middleware/error.middleware';
import { NotFoundError } from './exceptions/not-found.err';
import { User } from './http/middleware/user.middleware';
import { Auth } from './http/middleware/auth.middleware';

class App {
    public app: Application;
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
        this.app.use(cookieParser());
        this.app.use(User);
    }

    #initControllers(): void {
        [
            new NotificationController(),
            new SettingController(),
            new SmsController(),
            new DashboardController()
        ].forEach(controller => this.app.use('/api/v1', [Auth], controller.router));

        this.app.all('*', async () => {
            throw new NotFoundError();
        });
    }

    #initErrorHandling(): void {
        this.app.use(ErrorMiddleware);
    }

    listen(): void {
        this.app.listen(this.port, () => log.info(`App listening on port: ${this.port}`))
            .on('error', (err) => log.error('Startup error: ', err));
    }
}

export default App;
