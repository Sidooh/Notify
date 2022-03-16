import { Request, Response, Router } from 'express';
import ControllerInterface from '../../utils/interfaces/controller.interface';
import { Help } from '../../utils/helpers/helpers';
import ATService from '../../channels/sms/AT/AT.service';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';
import { Notification } from '../../models/notification.model';
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
        const notifications = await Notification.find({})
            .select(['id', 'destination', 'channel', 'event_type', 'content', 'provider', 'status', 'created_at', 'notifiable_type'])
            .sort('-_id').limit(10).populate('notifiable_id', ['data']);
        const count_notifications = await Notification.find({}).count();
        const weekly_notifications = await this.#weeklyNotifications();
        const default_sms_provider = await Help.getSetting('default_sms_provider');

        const balances = {
            websms        : Number((await new WebSMSService().balance()).match(/-?\d+\.*\d*/g)[0]),
            africastalking: Number((await new ATService().balance()).match(/-?\d+\.*\d*/g)[0])
        };

        return res.send({
            notifications,
            default_sms_provider,
            balances,
            count_notifications,
            weekly_notifications
        });
    };

    #weeklyNotifications = async () => {
        let weeklyNotifications = await Notification.aggregate([
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
        ]);

        const startOfWeek: number = moment().startOf('week').date();
        const endOfWeek: number = moment().endOf('week').date();

        const getDayName = (day: number, month: number, year: number) => {
            return moment(`${day}-${month}-${year}`, 'DD-MM-YYYY').format('ddd');
        };

        let datasets = [], labels = [];
        for (let day: number = startOfWeek; day <= endOfWeek; day++) {
            let label, count;

            if (weeklyNotifications.find(dataset => dataset.date.day === day)) {
                let { date, notifications } = weeklyNotifications.find(dataset => dataset.date.day === day);

                label = getDayName(day, date.month, date.year);
                count = notifications;
            } else {

                label = getDayName(day, Number(moment().format('M')), Number(moment().format('YYYY')));
                count = 0;
            }

            labels.push(label);
            datasets.push(count);
        }

        console.log(labels, datasets);

        return { labels, datasets };
    };
}
