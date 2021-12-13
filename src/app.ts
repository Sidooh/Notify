import express, {Application} from 'express'
import compression from "compression";
import cors from 'cors'
import morgan from 'morgan'
import Controller from '@/utils/interfaces/controller.interface'
import ErrorMiddleware from '@/middleware/error.middleware'
import helmet from 'helmet'
import mongoose from "mongoose";
import log from '@/utils/logger'
import {string} from "joi";

class App {
    public express: Application
    public port: number;

    constructor(controllers: Controller[], port: number) {
        this.express = express();
        this.port = port

        App.#initDatabase();
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
        controllers.forEach((controller: Controller) => {
            this.express.use('/api', controller.router)
        })
    }

    #initErrorHandling(): void {
        this.express.use(ErrorMiddleware)
    }

    static #initDatabase(): void {
        const {MONGO_PORT, MONGO_DATABASE, MONGO_HOST} = process.env

        mongoose.connect(
            `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`
        ).then(() => {
            log.info("Database connected!")
        })
    }

    listen(): void {
        this.express.listen(this.port, () => {
            console.log(`App listening on port: ${this.port}`)
        })
    }
}

export default App