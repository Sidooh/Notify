import { env } from '../utils/validate.env';

export default {
    services : {
        accounts: {
            url: env.SIDOOH_ACCOUNTS_API_URL
        },
        products: {
            url: env.SIDOOH_PRODUCTS_API_URL
        }
    },
    cron     : {
        sp_balance_notification_cron: env.SP_BALANCE_NOTIFICATION_CRON
    },
    providers: {
        at    : {
            sms    : {
                threshold: env.AT_SMS_THRESHOLD
            },
            ussd   : {
                threshold: env.AT_SMS_THRESHOLD
            },
            airtime: {
                threshold: env.AT_SMS_THRESHOLD
            }
        },
        websms: {
            threshold: env.WEBSMS_THRESHOLD
        },
        tanda : {
            float: {
                threshold: env.TANDA_FLOAT_THRESHOLD
            }
        }
    }
};
