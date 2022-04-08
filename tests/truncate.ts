import db from '../models';
import map from 'lodash/map';

const truncateTable = (modelName: string) => db.sequelize.models[modelName].destroy({ where: {}, force: true })

export default async function truncate(model?: string) {
    if (model) {
        return truncateTable(model);
    }

    return Promise.all(
        map(Object.keys(db.sequelize.models), (key) => {
            if (['sequelize', 'Sequelize'].includes(key)) return null;
            return truncateTable(key);
        })
    );
}