import axios from 'axios';
import ServiceInterface from '../../utils/interfaces/service.interface';
import { log } from '../../utils/logger';

export default class SlackService implements ServiceInterface {
    #message: string;

    constructor() {
        this.#message = "Hello world"
    }

    message = (message: string) => {
        this.#message = message

        return this;
    }

    send = async (): Promise<{ status: string }> => {
        return axios.post(process.env.SLACK_HOOK_URL as string, SlackService.template(this.#message)).then(() => {
            return {status: 'success'}
        }).catch(error => {
            log.error(error)

            return {status: 'failed'}
        })
    }

    static template = (message:string) => {
        return {
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Greetings!*"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `${message}`
                    },
                    "accessory": {
                        "type": "image",
                        "image_url": "https://api.slack.com/img/blocks/bkb_template_images/notifications.png",
                        "alt_text": "calendar thumbnail"
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Stay lit🔥*"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "plain_text",
                        "text": "Hoodis Out❗"
                    }
                }
            ]
        }
    }
}