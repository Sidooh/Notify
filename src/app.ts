import express, {Application} from 'express'
import compression from "compression";
import cors from 'cors'
import morgan from 'morgan'
import Controller from '@/utils/interfaces/controller.interface'
import helmet from 'helmet'
import mongoose from "mongoose";
import log from '@/utils/logger'
import ErrorMiddleware from "@/middleware/error.middleware";
import NotificationController from "@/resources/notification/notification.controller";
import SettingController from "@/resources/settings/setting.controller";

class App {
    public express: Application
    public port: number;

    constructor(controllers: Controller[], port: number) {
        this.express = express();
        this.express.set('trust proxy', true)
        this.port = port

        this.#initMiddleware();
        this.#initControllers(controllers);
        this.#initErrorHandling();
    }

    #initMiddleware(): void {
        this.express.use(helmet())
        this.express.use(cors())
        this.express.use(morgan('dev'))
        this.express.use(express.json())
        this.express.use(express.urlencoded({extended: false}))
        this.express.use(compression())
    }

    #initControllers(controllers: Controller[]): void {
        controllers.forEach((controller: Controller) => this.express.use('/api', controller.router))
    }

    #initErrorHandling(): void {
        this.express.use(ErrorMiddleware)
    }

    initDatabase(): App {
        const {MONGO_URL} = process.env

        mongoose.connect(`${MONGO_URL}`)
            .then(() => log.info("Database connected!"))

        return this
    }

    listen(): void {
        this.express.listen(this.port, () => console.log(`App listening on port: ${this.port}`))
    }
}

const app = new App([
    new NotificationController(),
    new SettingController(),
], Number(process.env.PORT))

export default app
