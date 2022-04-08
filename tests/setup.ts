import db from '../models';
import map from 'lodash/map';

export default async function truncate() {
    return await Promise.all(
        map(Object.keys(db.sequelize.models), (key) => {
            if (['sequelize', 'Sequelize'].includes(key)) return null;
            return db.sequelize.models[key].destroy({ where: {}, force: true });
        })
    );
}

beforeAll(async () => await db.sequelize.sync({ force: true }));
beforeEach(async () => await truncate());

afterAll(async () => await db.sequelize.close());

jest.setTimeout(10000);
