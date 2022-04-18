import { Request, Response, Router } from 'express';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { Help } from '../../utils/helpers';
import ATService from '../../channels/sms/AT/AT.service';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';
import { Notification } from '../../models/Notification';
import moment from 'moment';

export class DashboardController implements ControllerInterface {
    path: string = '/dashboard';
    router: Router = Router();

    constructor() {
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.path}/`, this.#dashboard);
    }

    #dashboard = async (req: Request, res: Response) => {
        const notifications = await Notification.find({
            select: ['id', 'destination', 'channel', 'event_type', 'content', 'provider', 'status', 'created_at'],
            order : { id: 'DESC' }, take: 20, relations: { notifiables: true }
        });
        const count_notifications = await Notification.count();
        const weekly_notifications = await this.#weeklyNotifications();
        const default_sms_provider = await Help.getSettings('default_sms_provider');

        const sms_credits = {
            websms        : (Number((await new WebSMSService().balance()).match(/-?\d+\.*\d*/g)[0])).toFixed(),
            africastalking: (Number((await new ATService().balance()).match(/-?\d+\.*\d*/g)[0]) / .8).toFixed()
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
        /*let weeklyNotifications = await Notification.aggregate([
            { $set: { 'date': { '$week': '$created_at' } } },
            { $match: { 'date': moment().week() - 1 } },
            {
                $group: {
                    _id  : {
                        day  : { $dayOfMonth: '$created_at' },
                        month: { $month: '$created_at' },
                        year : { $year: '$created_at' }
                    },
                    total: { $sum: 1 }
                }
            },
            { $project: { 'date': '$_id', 'notifications': '$total', '_id': 0 } }
        ]);*/

        const startDate = moment().startOf('week');
        const freqCount = 7;

        const getDayName = (day: number, month: number, year: number) => {
            return moment(`${day}-${month}-${year}`, 'DD-MM-YYYY').format('ddd');
        };

        let datasets = [], labels = [];
        for (let day: number = 0; day < freqCount; day++) {
            let label, count;

            /*if (weeklyNotifications.find(dataset => dataset.date.day === startDate.date())) {
                let {
                    date, notifications
                } = weeklyNotifications.find(dataset => dataset.date.day === startDate.date());

                label = getDayName(startDate.date(), date.month, date.year);
                count = notifications;
            } else {
                label = getDayName(startDate.date(), Number(startDate.format('M')), startDate.year());
                count = 0;
            }*/

            labels.push(label);
            datasets.push(count);

            startDate.add(1, 'd');
        }

        return { labels, datasets };
    };
}
