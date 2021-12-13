import {cleanEnv, port, str} from "envalid";

export default function validateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['development', 'production']
        }),
        MONGO_HOST: str(),
        MONGO_PORT: str(),
        MONGO_DATABASE: str(),
        PORT: port({default: 3000})
    })
}