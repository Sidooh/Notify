import 'dotenv/config';
import validateEnv, { env } from './utils/validate.env';
import App from './app';

validateEnv();

const app = new App(env.PORT);

app.listen();