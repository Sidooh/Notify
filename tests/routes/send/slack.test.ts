import App from '../../../src/app';
import supertest from 'supertest';

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

it('should return a 201 on successful slack notification creation', async function() {
    await request
        .post('/api/notifications')
        .send({
            channel: 'slack',
            content: 'Hello!'
        })
        .expect(201);
});