import request from 'supertest'
import {app} from "../../src";

it('should return a 201 on successful notification creation', async function () {
    await request(app)
        .post('/notifications')
        .send({
            channel: 'mail'
        })
        .expect(201)
}); 
