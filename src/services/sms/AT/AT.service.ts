import ServiceInterface from "@/utils/interfaces/service.interface";
import {ATCallback} from "@/models/at_callbacks.model";


export default class ATService implements ServiceInterface {
    #message: string = "";
    #to: string[] = [];
    #AT

    constructor() {
        const credentials = {
            apiKey: String(process.env.AT_SMS_API_KEY),
            username: String(process.env.AT_SMS_USERNAME),
        };

        this.#AT = require('africastalking')(credentials).SMS
    }

    to = (to: string[]) => {
        this.#to = to.map(phone => {
            phone = phone.toString()
            return `+254${(phone.length > 9 ? phone.slice(-9) : phone)}`;
        })

        return this;
    }

    message = (message: string) => {
        this.#message = message

        return this;
    }

    send = async (): Promise<{ status: string, provider: string }> => {
        const options = {
            to: this.#to,
            from: String(process.env.AT_SMS_FROM),
            message: this.#message
        }

        const response = await this.#AT.send(options)
            .then((response: any) => {
                this.#saveCallback(response.SMSMessageData)

                return {status: 'success'}
            })
            .catch((error: any) => {
                console.log(error);
                return {status: 'failed'}
            });

        return {...response, provider: 'AFRICASTALKING'}
    }

    #saveCallback = async (callback: any) => {
        const callbacks = callback.Recipients.map((recipient: any) => {
            let regex = /[+-]?\d+(\.\d+)?/g;

            return {
                message_id: recipient.messageId,
                phone: recipient.number,
                cost: parseFloat(recipient.cost.match(regex)[0]),
                status: recipient.status,
                status_code: recipient.statusCode
            }
        })

        await ATCallback.insertMany(callbacks)
    }
}
