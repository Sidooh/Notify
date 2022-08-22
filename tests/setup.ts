import { DataSource } from 'typeorm';
import { Notification } from '../src/models/Notification';
import { Notifiable } from '../src/models/Notifiable';
import { Setting } from '../src/models/Setting';
import { SMSProvider } from '../src/models/SMSProvider';

const dataSource = new DataSource({
    type       : 'sqlite',
    database   : ':memory:',
    dropSchema : true,
    entities   : [Notification, Notifiable, SMSProvider, Setting],
    synchronize: true,
    logging    : false
});

beforeAll(async () => await dataSource.initialize());

afterAll(async () => await dataSource.destroy());

jest.setTimeout(10000);
