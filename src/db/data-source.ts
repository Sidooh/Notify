import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Notification } from '../models/Notification';
import { Setting } from '../models/Setting';
import { Notifiable } from '../models/Notifiable';
import { SMSProvider } from '../models/SMSProvider';
import { env } from '../utils/validate.env';

export const AppDataSource = new DataSource({
    type          : 'mysql',
    host          : 'localhost',
    port          : env.DB_PORT,
    username      : env.DB_USERNAME,
    password      : env.DB_PASSWORD,
    database      : env.DB_DATABASE,
    socketPath    : env.DB_SOCKET,
    synchronize   : env.NODE_ENV !== 'production',
    logging       : false,
    entities      : [Notification, Notifiable, SMSProvider, Setting],
    migrations    : [],
    subscribers   : [],
    namingStrategy: new SnakeNamingStrategy()
});
