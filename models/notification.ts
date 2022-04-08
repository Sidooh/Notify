import { CreationOptional, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { EventType, Status } from '../src/utils/enums';
import { ATCallbackAttrs } from './atcallback';
import { WebsmsCallbackAttrs } from './websmscallback';
import merge from 'lodash/merge';

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
            this.hasMany(models.ATCallback);
            this.hasMany(models.WebsmsCallback);
        }
    }

    Notification.init({
        id         : {
            type         : DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey   : true
        },
        destination: {
            type     : DataTypes.STRING(30),
            allowNull: false
        },
        channel    : {
            type     : DataTypes.STRING(50),
            allowNull: false
        },
        event_type : {
            type        : DataTypes.STRING(50),
            defaultValue: EventType.DEFAULT,
            allowNull   : false
        },
        content    : {
            type     : DataTypes.TEXT,
            allowNull: false
        },
        provider   : DataTypes.STRING(50),
        status     : {
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
            const notifiables: ATCallbackAttrs[] | WebsmsCallbackAttrs[] = [];

            if (instance.ATCallbacks.length) merge(notifiables, instance.ATCallbacks);
            if (instance.WebsmsCallbacks.length) merge(notifiables, instance.WebsmsCallbacks);

            instance.setDataValue('notifiables', notifiables);

            // To prevent mistakes:
            delete instance.ATCallbacks;
            delete instance.dataValues.ATCallbacks;
            delete instance.WebsmsCallbacks;
            delete instance.dataValues.WebsmsCallbacks;
        }
    });

    return Notification;
};