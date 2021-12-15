import axios from 'axios';
import log from "@/utils/logger";

export default class SlackService {
    #message: string|string[];

    constructor() {
        this.#message = "Hello world"
    }

    message = (message: string) => {
        this.#message = message

        return this;
    }

    send = async (): Promise<{ status: string }> => {
        return axios.post(process.env.SLACK_HOOK_URL as string, {
            text: this.#message
        }).then(() => {
            return {status: 'success'}
        }).catch(error => {
            log.error(error)

            return {status: 'failed'}
        })
    }
}