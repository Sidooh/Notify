import express, { Application, json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import { log } from './utils/logger';
import { NotificationController, SettingController } from './http/controllers';
import { SmsProviderController } from './http/controllers/sms-provider.controller';
import { DashboardController } from './http/controllers/dashboard.controller';
import { ErrorMiddleware } from './http/middleware/error.middleware';
import { NotFoundError } from './exceptions/not-found.err';
import { User } from './http/middleware/user.middleware';
import { Auth } from './http/middleware/auth.middleware';
import * as Sentry from '@sentry/node';
import { Integrations } from '@sentry/tracing';
import { env } from './utils/validate.env';
import { JobController } from './http/controllers/job.controller';
import { CallbackController } from './http/controllers/callback.controller';
import { AnalyticsController } from './http/controllers/analytics.controller';

class App {
    public app: Application;
    public port: number;

    constructor(port: number) {
        this.app = express();
        this.port = port;

        /** --------------------------------    INIT SENTRY
         * */
        if (!env.isTest) {
            Sentry.init({
                dsn         : env.SENTRY_DSN,
                integrations: [
                    // enable HTTP calls tracing
                    new Sentry.Integrations.Http({ tracing: true }),
                    // enable Express.js middleware tracing
                    new Integrations.Express({ app: this.app })
                ],

                // Set tracesSampleRate to 1.0 to capture 100%
                // of transactions for performance monitoring.
                // We recommend adjusting this value in production
                tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE
            });

            // RequestHandler creates a separate execution context using domains, so that every
            // transaction/span/breadcrumb is attached to its own Hub instance
            this.app.use(Sentry.Handlers.requestHandler());
            // TracingHandler creates a trace for every incoming request
            this.app.use(Sentry.Handlers.tracingHandler());
            this.app.use(Sentry.Handlers.errorHandler());
        }

        this.#initMiddleware();
        this.#initControllers();
        this.#initErrorHandling();
    }

    #initMiddleware(): void {
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
        // @ts-ignore
        this.app.use(cookieParser());
        this.app.use(User);
    }

    #initControllers(): void {
        //  Authenticated Routes
        [
            new NotificationController,
            new SettingController,
            new SmsProviderController,
            new DashboardController,
            new AnalyticsController
        ].forEach(controller => this.app.use('/api/v1', [Auth], controller.router));

        //  Unauthenticated Routes
        [
            new JobController,
            new CallbackController
        ].forEach(controller => this.app.use('/', controller.router));

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
