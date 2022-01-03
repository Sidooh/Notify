import Joi from 'joi'

export const validateSetting = {
    create: Joi.object({
        type: Joi.string().valid('default_sms_provider', 'default_mail_provider').required(),
        value: Joi.string()
            .when('type', {
                is: 'default_sms_provider',
                then: Joi.valid('africastalking', 'websms', 'safaricom'),
            }).required()
            .when('type', {
                is: 'default_mail_provider',
                then: Joi.valid('gmail', 'yahoo', 'mailgun', 'postmark', 'sendgrid'),
            }).required(),
    })
}
