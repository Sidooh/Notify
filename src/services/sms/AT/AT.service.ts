import {AfricasTalking, ATConfig} from '@osenco/africastalking'
import log from "@/utils/logger";
import ServiceInterface from "@/utils/interfaces/service.interface";

export default class ATService implements ServiceInterface {
    #message: string;
    #to: string|string[]|number|number[] = [];
    #AT

    constructor() {
        this.#message = "Hello world"

        const config: ATConfig = {
            username: String(process.env.AT_USERNAME) ?? 'sandbox',
            apiKey: 'string',
            from: String(process.env.APP_NAME) ?? 'Sidooh'
        }

        this.#AT = new AfricasTalking(config, 'sandbox');
    }

    message = (message: string) => {
        this.#message = message

        return this;
    }

    send = async (): Promise<{ status: string }> => {
        return this.#AT.sms(this.#message).to(this.#to).send()
            .then(response => {
                console.log(response)
                return {status: 'success'}
            }).catch(error => {
                log.error(error, error.message);

                return {status: 'failed'}
            })
    }
}