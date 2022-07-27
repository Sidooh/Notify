import 'dotenv/config';
import validateEnv from './utils/validate.env';
import App from './app';
import { log } from './utils/logger';
import { AppDataSource } from './db/data-source';

validateEnv();

AppDataSource.initialize().then(async () => {
    log.info('Connected to Database');

    const app = new App(Number(process.env.PORT || 8005));

    app.listen();
}).catch(error => log.error('Database connection error: ', error))

