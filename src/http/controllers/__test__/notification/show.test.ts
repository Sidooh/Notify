import mongoose from 'mongoose';
import supertest from 'supertest';
import App from '../../../../app';

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

it('should return a 404 if a notification is not found.', async function () {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request
        .get(`/api/notifications/${id}`)
        .send().expect(404)
});

it('should return the notification if it exists.', async function () {
    const destination = "2547110039317",
        channel = 'sms';

    let response =  await request
        .post('/api/notifications')
        .send({
            channel,
            destination: [destination],
            event_type : 'AIRTIME_PURCHASE',
            content    : 'Testing sidooh notify...!'
        }).expect(201);

    response = await request
        .get(`/api/notifications/${response.body[0].id}`)
        .expect(200)

    expect(response.body.destination).toEqual(destination)
    expect(response.body.channel).toEqual(channel)
});
