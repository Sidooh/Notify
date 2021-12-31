import log from "@/utils/logger";
import ServiceInterface from "@/utils/interfaces/service.interface";
import {WebSmsConfig} from "@/services/sms/WebSMS/Lib/types";
import {WebSms} from "@/services/sms/WebSMS/Lib/client";

export default class WebSMSService implements ServiceInterface {
    #message: string = "";
    #to: string[] = [];
    #WebSMS

    constructor() {
        const config: WebSmsConfig = {
            accessKey: String(process.env.WEBSMS_ACCESS_KEY),
            apiKey: String(process.env.WEBSMS_API_KEY),
            clientId: String(process.env.WEBSMS_CLIENT_ID),
            senderId: String(process.env.WEBSMS_SENDER_ID),
        }

        this.#WebSMS = new WebSms(config, 'sandbox');
    }

    to = (to: string[]) => {
        this.#to = to

        return this;
    }

    message = (message: string) => {
        this.#message = message

        return this;
    }

    send = async (): Promise<{ status: string }> => {
        return this.#WebSMS.sms(this.#message).to(this.#to).send()
            .then(response => {
                console.log(response)
                return {status: 'success'}
            }).catch(error => {
                log.error(error, error.message);

                return {status: 'failed'}
            })
    }
}