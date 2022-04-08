import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { Help } from '../src/utils/helpers';
import { Status } from '../src/utils/enums';

export interface NotificationAttrs extends Model {
    id: CreationOptional<number>,
    notifiable_id: number
    notifiable_type: string | undefined
    destination: string
    channel: string
    event_type: string
    content: string
    provider: string | undefined
    status: string
}

module.exports = (sequelize: any, DataTypes: any) => {
    class Notification extends Model<InferAttributes<Notification>, InferCreationAttributes<Notification>> {
        declare id: CreationOptional<number>;
        declare notifiable_type: string;
        declare notifiable_id: number;
        declare destination: string;
        declare channel: string;
        declare event_type: string;
        declare content: string;
        declare provider: string;
        declare status: string;

        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models: any) {
            // define association here
            this.belongsTo(models.ATCallback, { foreignKey: 'notifiable_id', constraints: false });
            this.belongsTo(models.WebsmsCallback, { foreignKey: 'notifiable_id', constraints: false });
        }

        getNotifiable = (options: any) => {
            if (!this.notifiable_type) return Promise.resolve(null);

            const mixinMethodName = `get${Help.uppercaseFirst(this.notifiable_type)}`;

            // @ts-ignore
            return this[mixinMethodName](options);
        };
    }

    Notification.init({
        id             : {
            type         : DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey   : true
        },
        notifiable_id  : DataTypes.INTEGER,
        notifiable_type: DataTypes.STRING(50),
        destination    : DataTypes.STRING(30),
        channel        : DataTypes.STRING(50),
        event_type     : DataTypes.STRING(50),
        content        : DataTypes.TEXT,
        provider       : DataTypes.STRING(50),
        status         : {
            type        : DataTypes.STRING(20),
            allowNull   : false,
            defaultValue: Status.PENDING
        }
    }, {
        sequelize,
        modelName  : 'Notification',
        underscored: true
    });

    Notification.addHook('afterFind', findResult => {
        if (!findResult) return;

        // @ts-ignore
        if (!Array.isArray(findResult)) findResult = [findResult];

        // @ts-ignore
        for (const instance of findResult) {
            if (instance.notifiable_type === 'at_callback' && instance.ATCallback !== null) {
                instance.setDataValue('notifiable', instance.ATCallback)
            } else if (instance.notifiable_type === 'websms_callback' && instance.WebsmsCallback !== null) {
                instance.setDataValue('notifiable', instance.WebsmsCallback)
            }

            // To prevent mistakes:
            delete instance.ATCallback;
            delete instance.dataValues.ATCallback;
            delete instance.WebsmsCallback;
            delete instance.dataValues.WebsmsCallback;
        }
    });

    return Notification;
};