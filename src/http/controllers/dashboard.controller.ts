import { Request, Response } from 'express';
import moment from 'moment';
import { Help } from '../../utils/helpers';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';
import ATService from '../../channels/sms/AT/AT.service';
import Controller from './controller';
import WaveSMSService from '../../channels/sms/WaveSMS/WaveSMS.service';
import prisma from '../../db/prisma';
import NotificationRepository from '../../repositories/notification.repository';

const Notification = prisma.notification;

export class DashboardController extends Controller {
    constructor() {
        super('/dashboard');
        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}/chart`, this.#dashboardChart);
        this.router.get(`${this.basePath}/summaries`, this.#getSummaries);
        this.router.get(`${this.basePath}/recent-notifications`, this.#getRecentNotifications);
        this.router.get(`${this.basePath}/providers/balances`, this.#getProviderBalances);
    }

    #dashboardChart = async (req: Request, res: Response) => {
        let data = await prisma.$queryRaw`SELECT DATE_FORMAT(created_at, '%Y%m%d%H') as date, COUNT(id) as count
                                          FROM notifications
                                          GROUP BY date
                                          ORDER BY date`;

        return res.send(this.successResponse(data));
    };

    #getSummaries = async (req: Request, res: Response) => {
        const smsSettings = await Help.getSMSSettings();

        const startOfDay = moment().startOf('day').toDate();
        return res.send(this.successResponse({
            total_notifications      : await Notification.count(),
            total_notifications_today: await Notification.count({
                where: { created_at: { gte: startOfDay } }
            }),

            sms_costs      : await prisma.notifiable.aggregate({ _sum: { cost: true } }).then(r => r._sum.cost),
            sms_costs_today: await prisma.notifiable.aggregate({
                where: { created_at: { gte: startOfDay } },
                _sum : { cost: true }
            }).then(r => r._sum.cost ?? 0),

            default_sms_provider: smsSettings.default_provider
        }));
    };

    #getRecentNotifications = async (req: Request, res: Response) => {
        return res.send(this.successResponse(await (new NotificationRepository).findMany({
            select : {
                id    : true, destination: true, channel: true, event_type: true, content: true,
                status: true, created_at: true
            },
            orderBy: { id: 'desc' }, take: 50
        })));
    };

    #getProviderBalances = async (req: Request, res: Response) => {
        return res.send(this.successResponse({
            wavesms_balance       : await new WaveSMSService().balance(),
            websms_balance        : await new WebSMSService().balance(),
            africastalking_balance: await new ATService().balance(),
        }));
    };
}
