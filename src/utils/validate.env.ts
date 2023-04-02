import { bool, cleanEnv, num, port, str, url } from 'envalid';

export default function validateEnv() {
    return cleanEnv(process.env, {
        PORT: port({ default: 8003 }),

        LOG_LEVEL: str({ default: 'info', choices: ['info'] }),
        JWT_KEY  : str(),

        //  Typeorm Configs
        DB_HOST       : str({ default: '127.0.0.1' }),
        DB_PORT       : num({ default: 3306 }),
        DB_DATABASE   : str({ default: '' }),
        DB_USERNAME   : str({ default: '' }),
        DB_PASSWORD   : str({ default: '' }),
        DB_SOCKET     : str({ default: '' }),
        SYNCHRONIZE_DB: bool({ default: false }),

        //  Prisma Config
        DATABASE_URL: str(),

        MAIL_HOST     : str({ default: 'smtp.gmail.com' }),
        MAIL_PORT     : num({
            default: 587,
            choices: [465, 587]
        }),
        MAIL_USERNAME : str(),
        MAIL_PASSWORD : str(),
        MAIL_FROM_NAME: str({ default: 'SIDOOH' }),

        AT_SMS_API_KEY : str(),
        AT_SMS_USERNAME: str(),
        AT_SMS_FROM    : str(),

        AT_SMS_DEV_API_KEY : str({ default: '' }),
        AT_SMS_DEV_USERNAME: str({ default: '' }),

        AT_USSD_API_KEY : str(),
        AT_USSD_USERNAME: str(),

        WAVESMS_API_KEY   : str(),
        WAVESMS_PARTNER_ID: str(),
        WAVESMS_SENDER_ID : str({ default: 'Test' }),
        WAVESMS_COST      : num({ default: .2 }),

        WEBSMS_SANDBOX   : bool({ default: true }),
        WEBSMS_API_URL   : url({ default: 'https://api.onfonmedia.co.ke/v1/sms' }),
        WEBSMS_ACCESS_KEY: str(),
        WEBSMS_API_KEY   : str(),
        WEBSMS_CLIENT_ID : str(),
        WEBSMS_SENDER_ID : str(),
        WEBSMS_COST      : num({ default: .3 }),

        WEBSMS_DEV_ACCESS_KEY: str({ default: undefined }),
        WEBSMS_DEV_API_KEY   : str({ default: undefined }),
        WEBSMS_DEV_CLIENT_ID : str({ default: undefined }),
        WEBSMS_DEV_SENDER_ID : str({ default: undefined }),

        SLACK_HOOK_URL: url({ default: '' }),
        SLACK_LOGGING : str({
            default: 'enabled',
            choices: ['enabled', 'disabled']
        }),

        SENTRY_DSN               : url({ default: undefined }),
        SENTRY_TRACES_SAMPLE_RATE: num({ default: 0.0 }),

        SIDOOH_ACCOUNTS_API_URL: url({ default: 'http://localhost:8000/api/v1' }),
        SIDOOH_PRODUCTS_API_URL: url({ default: 'http://localhost:8001/api/v1' }),
        SIDOOH_PAYMENTS_API_URL: url({ default: 'http://localhost:8002/api/v1' }),
        SIDOOH_SAVINGS_API_URL : url({ default: 'http://localhost:8005/api/v1' }),

        SP_BALANCE_NOTIFICATION_ENABLED: bool({ default: true }),
        SP_BALANCE_NOTIFICATION_CRON   : str({ default: '0 18 */2 * *' }),
        ADMIN_CONTACTS                 : str({ default: '254110039317,254714611696,254711414987' }),

        WAVESMS_THRESHOLD: num({ default: 500 }),
        WEBSMS_THRESHOLD : num({ default: 500 }),
        AT_SMS_THRESHOLD : num({ default: 500 }),
        AT_USSD_THRESHOLD: num({ default: 500 })
    });
}

export const env = validateEnv();