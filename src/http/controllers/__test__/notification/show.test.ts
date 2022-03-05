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

/*
it('should return the notification if it exists.', async function () {
    const title = 'concert',
        price = 20;

    let response = await request
        .post('/api/tickets')
        .send({title, price})
        .expect(201)

    response = await request
        .get(`/api/tickets/${response.body.id}`)
        .expect(200)

    expect(response.body.title).toEqual(title)
    expect(response.body.price).toEqual(price)
});*/
