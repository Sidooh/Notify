import ServiceInterface from "@/utils/interfaces/service.interface";

export default class ATService implements ServiceInterface {
    #message: string;
    #to: string|string[] = [];
    #AT

    constructor() {
        this.#message = "Hello world"

        const credentials = {
            apiKey: String(process.env.AT_SMS_API_KEY),
            username: String(process.env.AT_SMS_USERNAME),
        };

        this.#AT = require('africastalking')(credentials).SMS
    }

    to = (to: string|string[]) => {
        this.#to = to

        return this;
    }

    message = (message: string) => {
        this.#message = message

        return this;
    }

    send = async (): Promise<{ status: string }> => {
        const options = {
            to: this.#to,
            message: this.#message
        }

        return this.#AT.send(options)
            .then((response: any) => {
                console.log(response.SMSMessageData);
                return {status: 'success'}
            })
            .catch((error: any) => {
                console.log(error);
                return {status: 'failed'}
            });
    }
}