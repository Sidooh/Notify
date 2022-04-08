import { config, createLogger, format, transports } from 'winston';
import SlackHook from 'winston-slack-webhook-transport';
import { FileTransportInstance } from 'winston/lib/winston/transports';

const { combine, timestamp, printf, align } = format;

const exceptionHandlers = [
    new transports.File({ filename: 'logs/exception.log' })
];

if ((process.env.SLACK_LOGGING || 'disabled') === 'enabled') {
    exceptionHandlers.push(<FileTransportInstance>new SlackHook({ webhookUrl: String(process.env.SLACK_HOOK_URL) }));
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
        new transports.File({ filename: 'logs/notify.log', level: process.env.LOG_LEVEL }),
        new transports.Console({ level: 'info' }),
        new SlackHook({
            level     : 'error',
            webhookUrl: String(process.env.SLACK_HOOK_URL),
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