import nodemailer from 'nodemailer';
import ServiceInterface from '../../utils/interfaces/service.interface';

export default class MailService implements ServiceInterface {
    fromAddress: string[] = [];
    fromName: string|null = null;
    recipientAddress: string|string[];
    mailSubject: string|undefined = "Hello!";
    mailText: string|undefined;
    mailHtml: string|undefined;

    constructor() {
        this.recipientAddress = []
        this.mailText = "Hello world?"
        this.mailHtml = "<b>Hello world?</b>"
    }

    from(senderAddress: string) {
        this.fromAddress.push(senderAddress)

        return this;
    }

    to(recipientAddress: string[]) {
        this.recipientAddress = recipientAddress

        return this;
    }

    subject(subject: string) {
        this.mailSubject = subject

        return this;
    }

    text(text: string) {
        this.mailText = text

        return this;
    }

    html(html: string) {
        this.mailHtml = html

        return this;
    }

    send = async () => {
        const transporter = this.#getTransporter();

        // send mail with defined transport object
        return await transporter.sendMail({
            from: {
                name: this.fromName ?? String(process.env.MAIL_FROM_NAME) ?? "Hoodis Notify",
                address: this.fromAddress.join(',')
            },
            to: this.recipientAddress,
            subject: this.mailSubject,
            text: this.mailText,
            html: this.mailHtml,
        });
    }

    #getTransporter = () => {
        // create reusable transporter object using the default SMTP transport

        return nodemailer.createTransport({
            service: "Gmail",
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT) | 587,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USERNAME, // generated ethereal user
                pass: process.env.MAIL_PASSWORD, // generated ethereal password
            },
        });
    }
}
