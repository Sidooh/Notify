import { beforeEach, describe, it, vi } from 'vitest';
import { Service } from '../service';
import { Slack } from '../index';
import { Channel, EventType, Status } from '../../../utils/enums';

vi.mock('../service', async () => {
    const Service = vi.fn(() => ({
        message: vi.fn(() => ({
            send: vi.fn(() => ({
                then: vi.fn()
            }))
        })),
        send   : vi.fn()
    }));

    return { Service };
});

let slacker: Slack, service: Service;

describe('slack', () => {
    beforeEach(() => {
        slacker = new Slack([{
            id         : 1n,
            channel    : Channel.SLACK,
            content    : 'Hello World',
            status     : Status.PENDING,
            destination: 'https://test.com',
            event_type : EventType.TEST,
            created_at : new Date,
            updated_at : new Date
        }]);

        service = new Service;
    });

    describe('send', () => {
        it('should send a slack notification.', async function() {
            await slacker.send();
        });
    });
});