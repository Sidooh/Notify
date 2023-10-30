import { Request, Response } from 'express';
import moment from 'moment';
import WebSMSService from '../../channels/sms/WebSMS/WebSMS.service';
import ATService, { ATApp } from '../../channels/sms/AT/AT.service';
import Controller from './controller';
import WaveSMSService from '../../channels/sms/WaveSMS/WaveSMS.service';
import NotificationRepository from '../../repositories/notification.repository';
import FileCache from '../../utils/cache/FileCache';
import db, { Setting } from '../../db/prisma';
import { Prisma } from '@prisma/client';
import { log } from '../../utils/logger';
import { SettingKey } from "../../utils/enums";

const Notification = db.notification;

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
        this.router.get(`${this.basePath}/ussd-balance`, this.#getUSSDBalance);
    }

    #dashboardChart = async (req: Request, res: Response) => {
        try {
            let data = await FileCache.remember('dashboard_chart', 3600, async () => {
                return await db.$queryRaw`SELECT DATE_FORMAT(created_at, '%Y%m%d%H') as date, COUNT(id) as count
                                          FROM notifications
                                          GROUP BY date
                                          ORDER BY date`;
            });

            return res.send(this.successResponse(data));
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                log.error(e.code);

                if (e.code === 'P2002') {
                    console.log(
                        'There is a unique constraint violation, a new user cannot be created with this email'
                    )
                }
            }

            throw e
        }
    };

    #getSummaries = async (req: Request, res: Response) => {
        const startOfDay = moment().startOf('day').toDate();

        const data = await FileCache.remember('dashboard_summaries', (3600), async () => {
            return {
                total_notifications      : await Notification.count(),
                total_notifications_today: await Notification.count({
                    where: { created_at: { gte: startOfDay } }
                }),

                sms_costs      : await db.notifiable.aggregate({ _sum: { cost: true } }).then(r => r._sum.cost),
                sms_costs_today: await db.notifiable.aggregate({
                    where: { created_at: { gte: startOfDay } },
                    _sum : { cost: true }
                }).then(r => r._sum.cost ?? 0),

                default_sms_provider: (await db.setting.findUnique({ where: { key: 'default_sms_provider' } }))?.value
            }
        })

        return res.send(this.successResponse(data));
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
            wasiliana_balance       : (await Setting.findUnique({ where: { key: SettingKey.WASILIANA_SMS_BALANCE } }))?.value,
            wavesms_balance       : await new WaveSMSService().balance(),
            websms_balance        : await new WebSMSService().balance(),
        }));
    };

    #getUSSDBalance = async (req: Request, res: Response) => {
        return res.send(this.successResponse(await new ATService(process.env.NODE_ENV, ATApp.USSD).balance() * .8));
    };
}
