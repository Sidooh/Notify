import 'dotenv/config';
import validateEnv from './utils/validateEnv';
import App from './app';
import mongoose from 'mongoose';
import { log } from './utils/logger';

validateEnv();

const initApp = () => {
    const { MONGO_URL } = process.env;

    mongoose.connect(`${MONGO_URL}`)
        .then(() => log.info('Database connected!')).catch(err => log.error(err));

    const app = new App(Number(process.env.PORT || 8003));
    app.listen();
};

initApp();
