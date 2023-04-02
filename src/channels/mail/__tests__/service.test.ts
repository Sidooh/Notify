import { beforeEach, describe, expect, it, vi } from 'vitest';
import Service from '../service';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Mail from 'nodemailer/lib/mailer';

let service: Service;
describe('mail.service', () => {
    beforeEach(() => {
        service = new Service;
    });

    describe('send', () => {
        it('should reject null recipients', async function() {
            vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
                sendMail(mailOptions: Mail.Options, callback: (err: (Error | null), info: SMTPTransport.SentMessageInfo) => Promise<SMTPTransport.SentMessageInfo>) {
                }
            } as Transporter<SMTPTransport.SentMessageInfo>);

            expect(() => service.to([]).send()).rejects.toThrow('At least one recipient email is required.');
            expect(() => service.send()).rejects.toThrow('At least one recipient email is required.');
        });

        it('should send an email if data is valid.', async function() {
            vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
                sendMail(mailOptions: Mail.Options, callback: (err: (Error | null), info: SMTPTransport.SentMessageInfo) => Promise<SMTPTransport.SentMessageInfo>) {
                    return Promise.resolve(<any>{
                            accepted    : ['sidooh@gmail.com'],
                            rejected    : [],
                            envelopeTime: 739,
                            messageTime : 709,
                            messageSize : 583,
                            response    : '250 2.0.0 OK  1678367829 k5-20020adfe8c5000000b002c56179d39esm17772704wrn.44 - gsmtp',
                            envelope    : { from: 'sidooh@gmail.com', to: ['tester@gmail.com'] },
                            messageId   : '<3b09acea-28cb-4c29-fbdd-0d9b87499420@gmail.com>'
                        }
                    );
                }
            } as Transporter<SMTPTransport.SentMessageInfo>);

            await service.to(['tester@gmail.com']).text('Hello World').send();

            expect(nodemailer.createTransport).toHaveBeenNthCalledWith(1, {
                auth   : { pass: 'something', user: 'something' },
                host   : 'smtp.gmail.com',
                port   : 587,
                secure : true,
                service: 'Gmail'
            });
        });
    });
});