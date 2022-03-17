import 'dotenv/config';
import validateEnv from './utils/validateEnv';
import App from './app';
import mongoose from 'mongoose';
import { log } from './utils/logger';

validateEnv()

const initApp = () => {
    const { MONGO_URL } = process.env;

    mongoose.connect(`${MONGO_URL}`)
        .then(() => log.info('Database connected!')).catch(err => log.error(err));

    const port = parseInt(process.env.PORT as string) || 8080;
    const app = new App(port);
    app.listen()
}

initApp()
