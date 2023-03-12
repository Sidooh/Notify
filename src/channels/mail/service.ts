import nodemailer from 'nodemailer';
import ServiceInterface from '../../utils/interfaces/service.interface';
import { env } from '../../utils/validate.env';

export default class Service implements ServiceInterface {
    fromAddress: string[] = [];
    fromName: string | null = null;
    #recipients: string[];
    #mailSubject: string | undefined = 'Hello!';
    #mailText: string | undefined;
    #mailHtml: string | undefined = '<b>Hello world?</b>';

    constructor() {
    }

    from(senderAddress: string) {
        this.fromAddress.push(senderAddress);

        return this;
    }

    to(address: string[]) {
        this.#recipients = address;

        return this;
    }

    subject(subject: string) {
        this.#mailSubject = subject;

        return this;
    }

    text(text: string) {
        this.#mailText = text;

        return this;
    }

    html(html: string) {
        this.#mailHtml = html;

        return this;
    }

    send = async () => {
        if (!this.#recipients || this.#recipients?.length <= 0) throw new Error('At least one recipient email is required.');

        const transporter = this.#getTransporter();

        // send mail with defined transport object
        return await transporter.sendMail({
            from   : {
                name   : this.fromName ?? env.MAIL_FROM_NAME,
                address: this.fromAddress.join(',')
            },
            to     : this.#recipients,
            subject: this.#mailSubject,
            text   : this.#mailText,
            html   : this.#mailHtml
        });
    };

    #getTransporter = () => {
        // create reusable transporter object using the default SMTP transport
        return nodemailer.createTransport({
            service: 'Gmail',
            host   : env.MAIL_HOST,
            port   : env.MAIL_PORT,
            secure : true, // true for 465, false for other ports
            auth   : {
                user: env.MAIL_USERNAME, // generated ethereal user
                pass: env.MAIL_PASSWORD // generated ethereal password
            }
        });
    };
}
