import { config, createLogger, format, transports } from 'winston';
import SlackHook from 'winston-slack-webhook-transport';
import { FileTransportInstance } from 'winston/lib/winston/transports';
import { env } from './validate.env';

const { combine, timestamp, printf, align } = format;

const exceptionHandlers = [
    new transports.File({ filename: 'logs/exception.log' })
];

if ((env.SLACK_LOGGING || 'disabled') === 'enabled' && env.SLACK_HOOK_URL !== null) {
    exceptionHandlers.push(<FileTransportInstance>new SlackHook({ webhookUrl: env.SLACK_HOOK_URL }));
}

export const log = createLogger({
    levels     : config.syslog.levels,
    format     : combine(
        timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS A' }),
        align(),
        printf(info => {
            const { timestamp, level, message, ...args } = info;
            const ts = timestamp.slice(0, 19).replace('T', ' ');

            return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        })
    ),
    exceptionHandlers,
    transports : [
        new transports.File({ filename: 'logs/notify.log', level: env.LOG_LEVEL }),
        new transports.Console({ level: 'info' }),
        new SlackHook({
            level     : 'error',
            webhookUrl: env.SLACK_HOOK_URL,
            formatter : info => {
                const { timestamp, level, message, ...args } = info;
                const stack = Object.keys(args).length ? JSON.stringify(args, null, 2) : '';

                return {
                    blocks: [
                        {
                            type: 'header',
                            text: {
                                type: 'plain_text',
                                text: `Error Alert!`
                            }
                        },
                        {
                            'type': 'divider'
                        },
                        {
                            'type': 'section',
                            'text': {
                                'type': 'mrkdwn',
                                'text': `*MESSAGE:* \n${message}\n${stack}`
                            }
                        },
                        {
                            'type': 'divider'
                        },
                        {
                            'type': 'section',
                            'text': {
                                'type': 'mrkdwn',
                                'text': `*LEVEL*: ${level.toUpperCase().padEnd(5)}`
                            }
                        }
                    ]
                };
            }
        })
    ],
    exitOnError: false
});