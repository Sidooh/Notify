import { beforeEach, describe, expect, it, vi } from 'vitest';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Mail as Mailer } from '../index';
import Mail from 'nodemailer/lib/mailer';
import { Channel, EventType, Status } from '../../../utils/enums';

let mail: Mailer;
describe('mailer', () => {
    beforeEach(() => {
        mail = new Mailer([{
            id         : 1n,
            channel    : Channel.MAIL,
            content    : 'Hello World',
            status     : Status.PENDING,
            destination: 'tester@gmail.com',
            event_type : EventType.TEST,
            created_at : new Date,
            updated_at : new Date
        }]);
    });

    describe('send', () => {
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

            await mail.send();

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