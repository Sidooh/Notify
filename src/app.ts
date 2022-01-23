import express, { Express } from 'express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import log from '@/utils/logger';
import ErrorMiddleware from '@/middleware/error.middleware';
import NotificationController from '@/resources/notification/notification.controller';
import SettingController from '@/resources/settings/setting.controller';
import path from 'path';
import IController from '@/utils/interfaces/controller.interface';

class App {
    public express: Express;
    public port: number;

    constructor(port: number) {
        this.express = express();
        this.port = port;

        this.#initMiddleware();
        this.#initControllers();
        this.#initErrorHandling();
    }

    #initMiddleware(): void {
        this.express.use(helmet());
        this.express.use(cors());
        this.express.use(morgan('dev'));
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(express.static(path.join(__dirname, 'public')));
        this.express.use(express.static(path.resolve(__dirname, '../../react-app/build')));
        this.express.use(compression());
    }

    #initControllers(): void {
        [
            new NotificationController(),
            new SettingController()
        ].forEach((controller: IController) => this.express.use('/api', controller.router));

        this.express.get('*', function(req, res) {
            res.sendFile(path.resolve(__dirname, '../../react-app/build', 'index.html'));
        });
    }

    #initErrorHandling(): void {
        this.express.use(ErrorMiddleware);
    }

    initDatabase(): App {
        const { MONGO_URL } = process.env;

        mongoose.connect(`${MONGO_URL}`)
            .then(() => log.info('Database connected!'));

        return this;
    }

    listen(): void {
        this.express.listen(this.port, () => console.log(`App listening on port: ${this.port}`));
    }
}

export default App;
