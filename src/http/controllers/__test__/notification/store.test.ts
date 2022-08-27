import supertest from 'supertest';
import App from '../../../../app';
import { Notification } from '../../../../models/Notification';
import { Help } from '../../../../utils/helpers';
import { Channel } from '../../../../utils/enums';

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

it('should have a route handler listening to /api/v1/notifications for post requests', async function() {
    const response = await request
        .post('/api/v1/notifications')
        .set({ Authorization: Help.testToken })
        .send({});

    expect(response.status).not.toEqual(404);
});

it('should return an error if request data is invalid.', async function() {
    await request
        .post('/api/v1/notifications')
        .set({ Authorization: Help.testToken })
        .send({
            channel: Channel.SMS,
            price  : 10
        }).expect(400);

    await request
        .post('/api/v1/notifications')
        .set({ Authorization: Help.testToken })
        .send({
            event_type: 'AIRTIME_PURCHASE',
            content   : 'Testing and much more testing...!'
        }).expect(400);
});

it('should create a notification if request data is valid.', async function() {
    let data = {
        channel    : Channel.SMS,
        destination: [2547110039317, 254736388405],
        event_type : 'AIRTIME_PURCHASE',
        content    : 'Testing and much more testing...!'
    };

    await request
        .post('/api/v1/notifications')
        .set({ Authorization: Help.testToken })
        .send(data).expect(201);

    const notifications = await Notification.find();

    expect(notifications[0].channel).toEqual(data.channel);
    expect(notifications[0].event_type).toEqual(data.event_type);
});