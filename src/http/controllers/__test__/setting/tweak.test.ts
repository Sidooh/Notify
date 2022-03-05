import supertest from 'supertest';
import App from '../../../../app';

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

it('should return a 404 if provided setting is invalid.', async function() {
    return request
        .post('/api/settings')
        .send({
            type: 'default_sms_provider',
            value: 'africastalking'
        })
        .expect(200);
});