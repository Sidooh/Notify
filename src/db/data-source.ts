import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Notification } from '../models/Notification';
import { Setting } from '../models/Setting';
import { Notifiable } from '../models/Notifiable';
import { SMSProvider } from '../models/SMSProvider';

export const AppDataSource = new DataSource({
    type          : 'mysql',
    host          : 'localhost',
    port          : Number(process.env.DB_PORT || 3306),
    username      : process.env.DB_USERNAME,
    password      : process.env.DB_PASSWORD,
    database      : process.env.DB_DATABASE,
    socketPath    : process.env.DB_SOCKET,
    synchronize   : process.env.NODE_ENV !== 'production',
    logging       : false,
    entities      : [Notification, Notifiable, SMSProvider, Setting],
    migrations    : [],
    subscribers   : [],
    namingStrategy: new SnakeNamingStrategy()
});
