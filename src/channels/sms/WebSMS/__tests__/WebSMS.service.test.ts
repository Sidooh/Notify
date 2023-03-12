import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { WebSms } from '@nabcellent/websms';
import WebSMSService from '../WebSMS.service';
import { Channel, EventType, Status } from '../../../../utils/enums';
import { SMSNotificationResults } from '../../../../utils/types';

let wave: WebSms, service: WebSMSService, notification = {
    id         : 1n,
    channel    : Channel.SMS,
    content    : 'Hello World',
    status     : Status.PENDING,
    destination: '254123456789',
    event_type : EventType.TEST,
    created_at : new Date,
    updated_at : new Date
};

describe('WebSMS service', () => {
    beforeAll(() => {
        wave = new WebSms({
            apiKey   : '',
            senderId : '',
            clientId : '',
            accessKey: ''
        });
        service = new WebSMSService;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should define message() and save()', async function() {
        expect(service.message).toBeTypeOf('function');
        expect(service.send).toBeTypeOf('function');
    });

    describe('to', () => {
        it('should be called with arguments', async function() {
            const toSpy = vi.spyOn(service, 'to');

            const res = service.to(['254110039317']);

            expect(res).toBeInstanceOf(WebSMSService);
            expect(toSpy).toHaveBeenNthCalledWith(1, ['254110039317']);
        });
    });

    describe('message', () => {
        it('should be called with arguments', async function() {
            const messageSpy = vi.spyOn(service, 'message');

            const res = service.message('Hello World!');

            expect(res).toBeInstanceOf(WebSMSService);
            expect(messageSpy).toHaveBeenNthCalledWith(1, 'Hello World!');
        });
    });

    describe('balance', () => {
        it('should fetch sms balance', async function() {
            const balanceSpy = vi.spyOn(service, 'balance').mockResolvedValue(70);

            const res = await service.balance();

            expect(balanceSpy).toHaveBeenCalledOnce();
            expect(res).toStrictEqual(70);
        });
    });

    describe('send', () => {
        it('should send a message', async function() {
            const sendSpy = vi.spyOn(service, 'send').mockResolvedValue({
                COMPLETED: [], FAILED: []
            } as SMSNotificationResults);
            const messageSpy = vi.spyOn(service, 'message');

            const res = await service.message('Hello World!').send([notification]);

            expect(sendSpy).toHaveBeenNthCalledWith(1, [notification]);

            expect(messageSpy).toHaveBeenCalledWith('Hello World!');
            expect(messageSpy).toHaveReturnedWith(service);

            expect(res).toStrictEqual({ COMPLETED: [], FAILED: [] });
        });
    });
});