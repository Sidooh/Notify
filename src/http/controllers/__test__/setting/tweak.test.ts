import supertest from 'supertest';
import App from '../../../../app';

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

it('should return a 200 if provided setting is valid.', async function() {
    return request
        .post('/api/v1/settings')
        .send({
            type: 'default_sms_provider',
            value: 'africastalking'
        })
        .expect(200);
});

it('should return a 400 if provided setting is invalid.', async function() {
    return request
        .post('/api/v1/settings')
        .send({
            type: 'default_sms_provider',
            value: 'africastalkingsa'
        })
        .expect(400);
});