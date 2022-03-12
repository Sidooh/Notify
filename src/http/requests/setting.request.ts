import Joi from 'joi';

export const SettingRequest = {
    create: Joi.object({
        type: Joi.string().valid('default_sms_provider', 'default_mail_provider', 'websms_sandbox').required(),
        value: Joi.when('type', {
                is: 'default_sms_provider',
                then: Joi.string().valid('africastalking', 'websms', 'safaricom'),
            }).required()
            .when('type', {
                is: 'default_mail_provider',
                then: Joi.string().valid('gmail', 'yahoo', 'mailgun', 'postmark', 'sendgrid'),
            }).required()
            .when('type', {
                is: 'websms_sandbox',
                then: Joi.boolean(),
            }).required(),
    })
}
