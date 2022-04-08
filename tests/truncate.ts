import db from '../models';

const truncateTable = (modelName: string) =>
    db.sequelize.models[modelName].destroy({
        where: {},
        force: true
    });

export default async function truncate(model?: string) {
    if (model) {
        return truncateTable(model);
    }

    return Promise.all(
        Object.keys(db.sequelize.models).map((key) => {
            if (['sequelize', 'Sequelize'].includes(key)) return null;
            return truncateTable(key);
        })
    );
}