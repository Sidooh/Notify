import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Channel, EventType, Status } from '../../utils/enums';
import db from '../../db/__mocks__/prisma';
import NotificationRepository from '../notification.repository';

const repo = new NotificationRepository;

const notification = {
    id         : 1n,
    channel: Channel.SMS,
    content: 'test',
    status: Status.COMPLETED,
    event_type: EventType.TEST,
    destination: '254110039317',
    created_at: new Date,
    updated_at: new Date
}

describe('notification.repository', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('index', () => {
        it('should return a list of notifications', async () => {
            db.notification.findMany.mockResolvedValueOnce([notification]);

            const notifications = await repo.index({});

            expect(notifications).toStrictEqual([notification]);
        });

        /*it('should create a notification if request data is valid.', async function() {
            let data = {
                channel    : Channel.SMS,
                destination: [254110039317, 254736388405],
                event_type : 'AIRTIME_PURCHASE',
                content    : 'Testing and much more testing...!'
            };

            // db.notification.create.mockResolvedValue(data);

            const notifications = await db.notification.findMany();

            expect(notifications[0].channel).toEqual(data.channel);
            expect(notifications[0].event_type).toEqual(data.event_type);
        });*/
    });
});