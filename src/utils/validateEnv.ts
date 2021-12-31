import {cleanEnv, num, port, str, url} from "envalid";

export default function validateEnv(): void {
    cleanEnv(process.env, {
        PORT: port({default: 3000}),

        NODE_ENV: str({
            choices: ['development', 'production']
        }),

        MONGO_HOST: str(),
        MONGO_PORT: str(),
        MONGO_DATABASE: str(),

        MAIL_HOST: str(),
        MAIL_PORT: num({
            choices: [465, 587]
        }),
        MAIL_USERNAME: str(),
        MAIL_PASSWORD: str(),

        AT_SMS_API_KEY: str(),
        AT_SMS_FROM: str(),
        AT_SMS_USERNAME: str(),

        SLACK_HOOK_URL: url()
    })
}