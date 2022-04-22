// import db from '../models';
import { DataSource } from 'typeorm';
import { Notification } from '../src/models/Notification';
import { Notifiable } from '../src/models/Notifiable';
import { Setting } from '../src/models/Setting';

const dataSource = new DataSource({
    type       : 'sqlite',
    database   : ':memory:',
    dropSchema : true,
    entities   : [Notification, Notifiable, Setting],
    synchronize: true,
    logging    : false
});

beforeAll(async () => await dataSource.initialize());

/*beforeEach(async () => {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
        const repository = await dataSource.getRepository(entity.name);
        await repository.clear();
    }
});*/

afterAll(async () => await dataSource.destroy());

jest.setTimeout(10000);
