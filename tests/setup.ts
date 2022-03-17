import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Sms } from '../src/channels/sms/WebSMS/Lib/sms';
import { WebSms } from '../src/channels/sms/WebSMS/Lib/client';
import axios from 'axios';

let mongo: any;

/**
 * _________________________________________________________________    MOCKS
 * */
jest.mock('axios');
jest.mock('winston-slack-webhook-transport');
jest.spyOn(new Sms(new WebSms({
    accessKey: String(process.env.WEBSMS_DEV_ACCESS_KEY),
    apiKey   : String(process.env.WEBSMS_DEV_API_KEY),
    clientId : String(process.env.WEBSMS_DEV_CLIENT_ID),
    senderId : String(process.env.WEBSMS_DEV_SENDER_ID)
})), 'send').mockImplementation(async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockResolvedValueOnce([]);

    const { data } = await mockedAxios.post('/SendBulkSMS', {});

    return data;
});
// initMocks()

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();

    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri);
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

jest.setTimeout(10000);
