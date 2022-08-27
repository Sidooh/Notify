import supertest from 'supertest';
import App from '../../../../app';
import { Help } from '../../../../utils/helpers';
import { Provider } from '../../../../utils/enums';

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

const createSetting = (key: string, value: string) => {
    return request
        .post('/api/v1/settings')
        .set({ Authorization: Help.testToken })
        .send({ key, value });
};

it('should fetch a list of settings.', async function() {
    await createSetting('default_sms_provider', Provider.AT);
    await createSetting('default_mail_provider', Provider.GMAIL);

    const response = await request
        .get('/api/v1/settings')
        .set({ Authorization: Help.testToken })
        .send()
        .expect(200);

    expect(response.body?.data?.length).toEqual(2);
});