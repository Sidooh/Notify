import 'dotenv/config';
import validateEnv, { env } from './utils/validate.env';
import App from './app';
import { log } from './utils/logger';
import { AppDataSource } from './db/data-source';
import Jobs from './jobs';

validateEnv();

AppDataSource.initialize().then(async () => {
    log.info('Connected to Database');

    const app = new App(Number(env.PORT || 8005));

    app.listen();

    Jobs();
}).catch(error => log.error('Database connection error: ', error))

