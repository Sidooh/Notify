export enum Status {
    PENDING = 'PENDING',
    FAILED = 'FAILED',
    COMPLETED = 'COMPLETED'
}
export enum Provider {
    WEBSMS = 'WEBSMS',
    AT = 'AFRICASTALKING',
    SLACK = 'SLACK',
    GMAIL = 'GMAIL',
}

export enum Channel {
    SLACK = 'SLACK',
    SMS = 'SMS',
    MAIL = 'MAIL',
    APP = 'APP',
}

export enum ENV {
    PRODUCTION = 'production',
    DEVELOPMENT = 'development',
}

export enum EventType {
    AIRTIME_PURCHASE = 'AIRTIME_PURCHASE',
    AIRTIME_PURCHASE_FAILURE = 'AIRTIME_PURCHASE_FAILURE',
    UTILITY_PAYMENT = 'UTILITY_PAYMENT',
    UTILITY_PAYMENT_FAILURE = 'UTILITY_PAYMENT_FAILURE',
    VOUCHER_PURCHASE = 'VOUCHER_PURCHASE',
    VOUCHER_REFUND = 'VOUCHER_REFUND',
    WITHDRAWAL_PAYMENT = 'WITHDRAWAL_PAYMENT',
    WITHDRAWAL_FAILURE = 'WITHDRAWAL_FAILURE',
    REFERRAL_INVITE = 'REFERRAL_INVITE',
    REFERRAL_JOINED = 'REFERRAL_JOINED',
    SUBSCRIPTION_PAYMENT = 'SUBSCRIPTION_PAYMENT',
    SUBSCRIPTION_EXPIRY = 'SUBSCRIPTION_EXPIRY',
    MERCHANT_PAYMENT = 'MERCHANT_PAYMENT',
    PAYMENT_FAILURE = 'PAYMENT_FAILURE',
    ERROR_ALERT = 'ERROR_ALERT',
    STATUS_UPDATE = 'STATUS_UPDATE',
    SP_REQUEST_FAILURE = 'SP_REQUEST_FAILURE',
    TEST = 'TEST',
    DEFAULT = 'DEFAULT',
}