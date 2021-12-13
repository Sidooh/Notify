import nodemailer from 'nodemailer'

export default class MailService {
    fromAddress: string[] = [];
    fromName: string = "";
    toAddress: string|string[];
    mailSubject: string|undefined;
    mailText: string|undefined;
    mailHtml: string|undefined;

    constructor() {
        this.toAddress = []
        this.mailText = "Hello world?"
        this.mailHtml = "<b>Hello world?</b>"
    }

    from(from: string) {
        this.fromAddress.push(from)

        return this;
    }

    to(to: string) {
        this.toAddress = to

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
                name: this.fromName,
                address: this.fromAddress.join(',')
            },
            to: this.toAddress, // list of receivers
            subject: this.mailSubject, // Subject line
            text: this.mailText, // plain text body
            html: this.mailHtml,
        });
    }

    #getTransporter = () => {
        // create reusable transporter object using the default SMTP transport
        return nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USERNAME, // generated ethereal user
                pass: process.env.MAIL_PASSWORD, // generated ethereal password
            },
        });
    }
}