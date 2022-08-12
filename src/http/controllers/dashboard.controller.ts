import { Request, Response } from 'express';
import { Notification } from '../../models/Notification';
import moment from 'moment';
import { AppDataSource } from '../../db/data-source';
import { Between } from 'typeorm';
import { Help } from '../../utils/helpers';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';
import ATService from '../../channels/sms/AT/AT.service';
import Controller from './controller';

export class DashboardController extends Controller {
    constructor() {
        super('/dashboard');
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}/`, this.#dashboard);
    }

    #dashboard = async (req: Request, res: Response) => {
        const notifications = await Notification.find({
            select: ['id', 'destination', 'channel', 'event_type', 'content', 'status', 'created_at'],
            order : { id: 'DESC' }, take: 20, relations: { notifiables: true }
        });
        const count_notifications = await Notification.count();
        const weekly_notifications = await this.#weeklyNotifications();

        const smsSettings = await Help.getSMSSettings()
        const default_sms_provider = smsSettings.provider

        const sms_credits = {
            websms        : (Number((await new WebSMSService(smsSettings.websms_env).balance()).slice(3))).toFixed(2),
            africastalking: (Number((await new ATService(smsSettings.africastalking_env).balance()).slice(3)) / .8).toFixed(2)
        };

        return res.send({
            notifications,
            default_sms_provider,
            sms_credits,
            count_notifications,
            weekly_notifications
        });
    };

    #weeklyNotifications = async () => {
        const startDate = moment().startOf('week');
        const endDate = moment().endOf('week');

        let weeklyNotifications = await AppDataSource.getRepository(Notification).createQueryBuilder('notification')
            .select('DAY(created_at) AS day, MONTH(created_at) as month, YEAR(created_at) as year')
            .addSelect('COUNT(created_at)', 'count')
            .where({
                created_at: Between(startDate.toDate(), endDate.toDate())
            })
            .groupBy('year, month, day')
            .getRawMany();

        const freqCount = 7;

        const getDayName = (day: number, month: number, year: number) => {
            return moment(`${day}-${month}-${year}`, 'DD-MM-YYYY').format('ddd');
        };

        let datasets = [], labels = [];
        for (let day: number = 0; day < freqCount; day++) {
            let label, count;

            if (weeklyNotifications.find(dataset => dataset.day === startDate.date())) {
                let {
                    month, year, count: notificationsCount
                } = weeklyNotifications.find(({ day }) => day === startDate.date());

                label = getDayName(startDate.date(), month, year);
                count = Number(notificationsCount);
            } else {
                label = getDayName(startDate.date(), Number(startDate.format('M')), startDate.year());
                count = 0;
            }

            labels.push(label);
            datasets.push(count);

            startDate.add(1, 'd');
        }

        return { labels, datasets };
    };
}
