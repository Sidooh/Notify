import db from '../models';
import truncate from './truncate';

beforeAll(async () => await db.sequelize.sync({ force: true }));
beforeEach(async () => await truncate());

afterAll(async () => await db.sequelize.close());

jest.setTimeout(10000);
