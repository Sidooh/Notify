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

        AT_USSD_API_KEY : str(),
        AT_USSD_USERNAME: str(),

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
        SENTRY_TRACES_SAMPLE_RATE: num({ default: 0.0 }),

        SIDOOH_ACCOUNTS_API_URL: url({ default: 'http://localhost:8000/api/v1' }),
        SIDOOH_PRODUCTS_API_URL: url({ default: 'http://localhost:8001/api/v1' }),

        SP_BALANCE_NOTIFICATION_ENABLED: bool({ default: true }),
        SP_BALANCE_NOTIFICATION_CRON   : str({ default: '0 18 */2 * *' }),
        ADMIN_CONTACTS                 : str({ default: '254110039317,254714611696,254711414987' }),

        TANDA_FLOAT_THRESHOLD: num({ default: 25000 }),
        WEBSMS_THRESHOLD     : num({ default: 500 }),
        AT_SMS_THRESHOLD     : num({ default: 500 }),
        AT_AIRTIME_THRESHOLD : num({ default: 1000 }),
        AT_USSD_THRESHOLD    : num({ default: 500 })
    });
}

export const env = validateEnv();