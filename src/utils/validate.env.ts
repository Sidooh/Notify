import { bool, cleanEnv, num, port, str, url } from 'envalid';

export default function validateEnv() {
    return cleanEnv(process.env, {
        PORT: port({ default: 3000 }),

        NODE_ENV: str({
            choices: ['test', 'development', 'production']
        }),

        JWT_KEY: str(),

        // DB_SOCKET: url(),

        DB_HOST    : str({ default: '127.0.0.1' }),
        DB_PORT    : num({ default: 3306 }),
        DB_DATABASE: str(),
        DB_USERNAME: str(),
        DB_PASSWORD: str(),

        // MAIL_HOST    : str(),
        // MAIL_PORT    : num({
        //     choices: [465, 587]
        // }),
        // MAIL_USERNAME: str(),
        // MAIL_PASSWORD: str(),

        AT_SMS_API_KEY     : str(),
        AT_SMS_USERNAME    : str(),
        AT_SMS_DEV_API_KEY : str(),
        AT_SMS_DEV_USERNAME: str(),
        AT_SMS_FROM        : str(),

        WEBSMS_SANDBOX: bool({ default: true }),
        // WEBSMS_API_URL   : url(),
        WEBSMS_ACCESS_KEY: str(),
        WEBSMS_API_KEY   : str(),
        WEBSMS_CLIENT_ID : str(),
        WEBSMS_SENDER_ID : str(),

        WEBSMS_DEV_ACCESS_KEY: str({ default: null }),
        WEBSMS_DEV_API_KEY   : str({ default: null }),
        WEBSMS_DEV_CLIENT_ID : str({ default: null }),
        WEBSMS_DEV_SENDER_ID : str({ default: null }),

        // SLACK_HOOK_URL: url(),
        SLACK_LOGGING: str({
            default: 'enabled',
            choices: ['enabled', 'disabled']
        }),

        SENTRY_DSN               : url({ default: null }),
        SENTRY_TRACES_SAMPLE_RATE: num({ default: 0.0 })
    });
}

export const env = validateEnv();