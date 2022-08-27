import supertest from 'supertest';
import App from '../../../../app';
import { Channel, EventType } from '../../../../utils/enums';
import { Help } from '../../../../utils/helpers';

const { app } = new App(Number(process.env.PORT || 4000));
const request = supertest(app);

const createNotification = () => {
    return request
        .post('/api/v1/notifications')
        .set({ Authorization: Help.testToken })
        .send({
            channel    : Channel.SMS,
            destination: [2547110039317, 254736388405],
            event_type : EventType.AIRTIME_PURCHASE,
            content    : 'Testing sidooh notify...!'
        });
};

it('should fetch a list of notifications.', async function() {
    await createNotification();
    await createNotification();
    await createNotification();

    const response = await request
        .get('/api/v1/notifications')
        .set({ Authorization: Help.testToken })
        .send()
        .expect(200);

    expect(response.body?.data?.length).toEqual(6);
});