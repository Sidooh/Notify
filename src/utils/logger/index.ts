import pino from 'pino'
import dayjs from "dayjs";

const log = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            timestampKey: `'time':'${dayjs().format()}'`,
            customPrettifiers: {
                time: `'time':'${dayjs().format()}'`
            }
        }
    },
    base: {
        pid: false,
    },
})

export default log
