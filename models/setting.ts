import { Model } from 'sequelize';

module.exports = (sequelize: any, DataTypes: any) => {
    class Setting extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models: any) {
            // define association here
        }
    }

    Setting.init({
        type : DataTypes.STRING,
        value: DataTypes.STRING
    }, {
        sequelize,
        modelName  : 'Setting',
        underscored: true,
        timestamps: false
    });

    return Setting;
};