import { beforeAll, describe, expect, it, vi } from 'vitest';
import { SMS } from '../index';
import { Channel, EventType, Status } from '../../../utils/enums';

let channel: SMS, notification = {
    id         : 1n,
    channel    : Channel.SMS,
    content    : 'Hello World',
    status     : Status.PENDING,
    destination: '254123456789',
    event_type : EventType.TEST,
    created_at : new Date,
    updated_at : new Date
};
describe('sms', () => {
    beforeAll(() => {
        const settings = { websms_env: 'test', africastalking_env: 'test', default_provider: 'WAVESMS', providers: [] };

        channel = new SMS([notification], settings);
    });

    it('should define send() and retry()', async function() {
        expect(channel.send).toBeTypeOf('function');
    });

    describe('send', () => {
        it('should send an sms notification', async function() {
            const sendSpy = vi.spyOn(channel, 'send').mockResolvedValue();

            await channel.send();

            expect(sendSpy).toHaveBeenCalledOnce();
        });
    });
});