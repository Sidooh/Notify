import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Notification } from '../models/Notification';
import { Setting } from '../models/Setting';
import { Notifiable } from '../models/Notifiable';

export const AppDataSource = new DataSource({
    type          : 'mysql',
    host          : 'localhost',
    port          : Number(process.env.DB_PORT || 3306),
    username      : process.env.DB_USERNAME,
    password      : process.env.DB_PASSWORD,
    database      : process.env.DB_DATABASE,
    socketPath    : process.env.DB_SOCKET,
    synchronize   : true,
    logging       : false,
    entities      : [Notification, Notifiable, Setting],
    migrations    : [],
    subscribers   : [],
    namingStrategy: new SnakeNamingStrategy()
});
