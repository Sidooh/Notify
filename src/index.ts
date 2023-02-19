import 'dotenv/config';
import validateEnv, { env } from './utils/validate.env';
import App from './app';
import { log } from './utils/logger';
import { AppDataSource } from './db/data-source';

validateEnv();

AppDataSource.initialize().then(async () => {
    log.info('Connected to Database');

    const app = new App(env.PORT);

    app.listen();
}).catch(error => log.error('Database connection error: ', error));

