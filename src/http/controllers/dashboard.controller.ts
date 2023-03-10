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
    }

    #dashboardChart = async (req: Request, res: Response) => {
        let notificationsTimeSeries = await prisma.$queryRaw`SELECT DATE_FORMAT(created_at, '%Y%m%d%H') as date, COUNT(id) as count
                                                             FROM notifications
                                                             GROUP BY date
                                                             ORDER BY date`;

        return res.send(notificationsTimeSeries);
    };

    #getSummaries = async (req: Request, res: Response) => {
        const smsSettings = await Help.getSMSSettings();

        const sms_credits = {
            wavesms       : await new WaveSMSService().balance(),
            websms        : await new WebSMSService(smsSettings.websms_env).balance(),
            africastalking: await new ATService(smsSettings.africastalking_env).balance()
        };

        const startOfDay = moment().startOf('day').toDate();
        return res.send(this.successResponse({
            data: {
                total_notifications      : await Notification.count(),
                total_notifications_today: await Notification.count({
                    where: {
                        created_at: {
                            gte: startOfDay,
                            lte: moment().toDate()
                        }
                    }
                }),

                sms_credits,
                default_sms_provider: smsSettings.default_provider
            }
        }));
    };

    #getRecentNotifications = async (req: Request, res: Response) => {
        return res.send(this.successResponse({
            data: await (new NotificationRepository).findMany({
                select : {
                    id    : true, destination: true, channel: true, event_type: true, content: true,
                    status: true, created_at: true
                },
                orderBy: { id: 'desc' }, take: 50
            })
        }));
    };
}
