import App from '../../../src/app';
import supertest from 'supertest';

const app = new App(Number(process.env.PORT || 4000));
const request = supertest(app.express);

it('should return a 201 on successful sms notification creation', async function() {
    await request
        .post('/api/notifications')
        .send({
            channel: 'sms',
            destination: ['254110039317'],
            content: 'Hello!'
        })
        .expect(201);
});