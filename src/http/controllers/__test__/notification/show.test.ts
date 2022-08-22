import supertest from 'supertest';
import App from '../../../../app';
import { Help } from '../../../../utils/helpers';
import { Channel } from '../../../../utils/enums';

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

it('should return a 404 if a notification is not found.', async function() {
    await request
        .get(`/api/v1/notifications/${0}`)
        .set('Authorization', Help.testToken)
        .send().expect(404);
});

it('should return the notification if it exists.', async function() {
    const destination = '2547110039317',
        channel = Channel.SMS;

    let response = await request
        .post('/api/v1/notifications')
        .set({ Authorization: Help.testToken })
        .send({
            channel,
            destination: [destination],
            event_type : 'AIRTIME_PURCHASE',
            content    : 'Testing sidooh notify...!'
        }).expect(201);

    response = await request
        .get(`/api/v1/notifications/${response.body.data.ids[0]}`)
        .set({ Authorization: Help.testToken })
        .expect(200);

    expect(response.body.data.destination).toEqual(destination);
    expect(response.body.data.channel).toEqual(channel);
});
