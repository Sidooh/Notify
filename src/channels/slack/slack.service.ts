import axios from 'axios';
import ServiceInterface from '../../utils/interfaces/service.interface';
import { log } from '../../utils/logger';
import { Status } from '../../utils/enums';
import { env } from '../../utils/validate.env';

export default class SlackService implements ServiceInterface {
    #message: string;

    constructor() {
        this.#message = 'Hello world';
    }

    message = (message: string) => {
        this.#message = message;

        return this;
    };

    send = async (): Promise<{ status: string }> => {
        if (env.SLACK_HOOK_URL === null) {
            log.error('SLACK_HOOK_URL env not set.')

            return { status: Status.FAILED };
        }

        return axios.post(env.SLACK_HOOK_URL, SlackService.template(this.#message)).then(() => {
            return { status: Status.COMPLETED };
        }).catch(error => {
            log.error(error);

            return { status: Status.FAILED };
        });
    };

    static template = (message: string) => {
        return {
            'blocks': [
                {
                    'type': 'section',
                    'text': {
                        'type': 'mrkdwn',
                        'text': '*Greetings!*'
                    }
                },
                {
                    'type': 'divider'
                },
                {
                    'type'     : 'section',
                    'text'     : {
                        'type': 'mrkdwn',
                        'text': `${message}`
                    },
                    'accessory': {
                        'type'     : 'image',
                        'image_url': 'https://api.slack.com/img/blocks/bkb_template_images/notifications.png',
                        'alt_text' : 'calendar thumbnail'
                    }
                },
                {
                    'type': 'divider'
                },
                {
                    'type': 'section',
                    'text': {
                        'type': 'mrkdwn',
                        'text': '*Stay lit🔥*'
                    }
                },
                {
                    'type': 'section',
                    'text': {
                        'type': 'plain_text',
                        'text': 'Hoodis Out❗'
                    }
                }
            ]
        };
    };
}