import { Model } from 'sequelize';

export interface WebsmsCallbackAttrs extends Model {
    id: number;
    phone: string;
    status: string;
}

module.exports = (sequelize: any, DataTypes: any) => {
    class WebsmsCallback extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models: any) {
            // define association here
            this.hasOne(models.Notification, {
                foreignKey : 'notifiable_id',
                constraints: false,
                scope      : {
                    notifiable_type: 'websms_callback'
                }
            });
        }
    }

    WebsmsCallback.init({
        message_id : DataTypes.STRING,
        phone      : DataTypes.STRING(15),
        description: DataTypes.STRING,
        status     : DataTypes.STRING,
        status_code: DataTypes.INTEGER
    }, {
        sequelize,
        modelName  : 'WebsmsCallback',
        underscored: true
    });
    return WebsmsCallback;
};