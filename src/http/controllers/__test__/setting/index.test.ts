import supertest from 'supertest';
import App from '../../../../app';

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

const createSetting = (type: string, value: string) => {
    return request
        .post('/api/settings')
        .send({ type, value });
};

it('should fetch a list of settings.', async function() {
    await createSetting('default_sms_provider', 'africastalking');
    await createSetting('default_mail_provider', 'gmail');

    const response = await request
        .get('/api/settings')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(2);
});