import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Notification } from '../models/Notification';
import { ATCallback } from '../models/ATCallback';
import { WebsmsCallback } from '../models/WebsmsCallback';
import { Setting } from '../models/Setting';

export const AppDataSource = new DataSource({
    type          : 'mysql',
    host          : 'localhost',
    port          : 3306,
    username      : process.env.DB_USERNAME,
    password      : process.env.DB_PASSWORD,
    database      : process.env.DB_DATABASE,
    synchronize   : true,
    logging       : false,
    entities      : [Notification, ATCallback, WebsmsCallback, Setting],
    migrations    : [],
    subscribers   : [],
    namingStrategy: new SnakeNamingStrategy()
});
