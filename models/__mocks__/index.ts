const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db: any = {};

let sequelize: any = new Sequelize('sqlite::memory:');

fs
    .readdirSync(__dirname)
    .filter((file: string) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.ts'))
    .forEach((file: any) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);

        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) db[modelName].associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
