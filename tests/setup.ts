import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Sms } from '../src/channels/sms/WebSMS/Lib/sms';
import { WebSms } from '../src/channels/sms/WebSMS/Lib/client';

let mongo: any;

jest.spyOn(new Sms(new WebSms({
    accessKey: String(process.env.WEBSMS_DEV_ACCESS_KEY),
    apiKey   : String(process.env.WEBSMS_DEV_API_KEY),
    clientId : String(process.env.WEBSMS_DEV_CLIENT_ID),
    senderId : String(process.env.WEBSMS_DEV_SENDER_ID)
})), 'send').mockImplementation(() => {
    // return new Promise<any>(() => jest.fn())
    // return jest.fn(() => Promise.resolve({ data: {} }));
    return Promise.resolve({ data: {} });
});

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
