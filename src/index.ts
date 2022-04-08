import 'dotenv/config';
import validateEnv from './utils/validateEnv';
import App from './app';
import db from '../models';
import { log } from './utils/logger';

validateEnv();

const initApp = () => {
    db.sequelize.sync(/*{ force: true }*/).then(() => {
        log.info('Connected to Database');

        const app = new App(Number(process.env.PORT || 8003));
        app.listen();
    });
};

initApp();
