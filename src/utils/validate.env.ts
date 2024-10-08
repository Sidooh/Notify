import { bool, cleanEnv, num, port, str, url } from 'envalid';
import { CacheDriver } from './enums';

export default function validateEnv() {
    return cleanEnv(process.env, {
        CACHE_DRIVER: str<CacheDriver>({ default: CacheDriver.FILE, choices: [CacheDriver.FILE, CacheDriver.MEMORY] }),

        PORT: port({ default: 8003 }),

        LOG_LEVEL: str({ default: 'info', choices: ['info'] }),
        JWT_KEY  : str(),

        DATABASE_URL: str(),

        MAIL_HOST     : str({ default: 'smtp.gmail.com' }),
        MAIL_PORT     : num({
            default: 587,
            choices: [465, 587]
        }),
        MAIL_USERNAME : str(),
        MAIL_PASSWORD : str(),
        MAIL_FROM_NAME: str({ default: 'SIDOOH' }),

        AT_SANDBOX     : str({ default: 'development' }),
        AT_SMS_API_KEY : str(),
        AT_SMS_USERNAME: str(),
        AT_SMS_FROM    : str(),

        AT_SMS_DEV_API_KEY : str({ default: '' }),
        AT_SMS_DEV_USERNAME: str({ default: '' }),

        AT_USSD_API_KEY : str(),
        AT_USSD_USERNAME: str(),

        WASILIANA_SANDBOX  : str({ default: 'development' }),
        WASILIANA_API_KEY  : str(),
        WASILIANA_SENDER_ID: str(),
        WASILIANA_COST     : num({ default: .2 }),

        WAVESMS_SANDBOX   : str({ default: 'development' }),
        WAVESMS_API_KEY   : str(),
        WAVESMS_PARTNER_ID: str(),
        WAVESMS_SENDER_ID : str(),
        WAVESMS_COST      : num({ default: .2 }),

        WAVESMS_DEV_SENDER_ID: str({ default: 'Test' }),

        WEBSMS_SANDBOX   : str({ default: 'development' }),
        WEBSMS_API_URL   : url({ default: 'https://api.onfonmedia.co.ke/v1/sms' }),
        WEBSMS_ACCESS_KEY: str(),
        WEBSMS_API_KEY   : str(),
        WEBSMS_CLIENT_ID : str(),
        WEBSMS_SENDER_ID : str(),
        WEBSMS_COST      : num({ default: .3 }),

        WEBSMS_DEV_ACCESS_KEY: str({ default: '' }),
        WEBSMS_DEV_API_KEY   : str({ default: '' }),
        WEBSMS_DEV_CLIENT_ID : str({ default: '' }),
        WEBSMS_DEV_SENDER_ID : str({ default: '' }),

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

        WASILIANA_THRESHOLD: num({ default: 500 }),
        WAVESMS_THRESHOLD: num({ default: 500 }),
        WEBSMS_THRESHOLD : num({ default: 500 }),
        AT_SMS_THRESHOLD : num({ default: 500 }),
        AT_USSD_THRESHOLD: num({ default: 500 }),

        SMS_RETRY_INTERVAL: num({ default: 45 }),
        SMS_RETRIES       : num({ default: 2 })
    });
}

export const env = validateEnv();