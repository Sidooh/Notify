import request from 'supertest'
import App from "../../src/app";

it('should return a 201 on successful notification creation', async function () {
    await request(App)
        .post('/notifications')
        .send({
            channel: 'mail'
        })
        .expect(201)
}); 
