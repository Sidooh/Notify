import { Request, Response } from 'express';
import Controller from './controller';
import prisma from '../../db/prisma';
import FileCache from '../../utils/cache/FileCache';
import { Provider } from '../../utils/enums';

type SLOResult = [{ slo: number }]

export class AnalyticsController extends Controller {
    constructor() {
        super('/analytics');

        this.#initRoutes();
    }

    #initRoutes(): void {
        this.router.get(`${this.basePath}/notifications`, this.#notifications);
        this.router.get(`${this.basePath}/notification-costs`, this.#notificationCosts);
        this.router.get(`${this.basePath}/slo/notifications`, this.#notificationsSLO);
        this.router.get(`${this.basePath}/slo/vendors`, this.#vendorsSLO);
    }

    #notifications = async (req: Request, res: Response) => {
        if(req.query['bypass-cache'] === 'true') FileCache.forget('count_notifications_analytics')

        let data = await FileCache.remember('count_notifications_analytics', (3600 * 24), async () => {
            return await prisma.$queryRaw`SELECT status, DATE_FORMAT(created_at, '%Y%m%d%H') as date, COUNT(id) as count
                                          FROM notifications
                                          GROUP BY date, status
                                          ORDER BY date`;
        });

        return res.send(this.successResponse(data));
    };

    #notificationCosts = async (req: Request, res: Response) => {
        if(req.query['bypass-cache'] === 'true') FileCache.forget('notification_costs_analytics')

        let data = await FileCache.remember('notification_costs_analytics', (3600 * 24), async () => {
            return await prisma.$queryRaw`SELECT status,
                                                 provider,
                                                 DATE_FORMAT(created_at, '%Y%m%d%H') as date,
                                                 SUM(cost)                           as amount
                                          FROM notifiables
                                          GROUP BY date, status, provider
                                          ORDER BY date`;
        });

        return res.send(this.successResponse(data));
    };

    #notificationsSLO = async (req: Request, res: Response) => {
        if(req.query['bypass-cache'] === 'true') FileCache.forget('notifications_slo')

        const data = await FileCache.remember('notifications_slo', (3600 * 24 * 7), async () => {
            return await prisma.$queryRaw`SELECT YEAR(created_at) AS year, status, COUNT(*) as count
                                          FROM notifications
                                          GROUP BY year, status;`;
        });

        return res.send(this.successResponse(data));
    };

    #vendorsSLO = async (req: Request, res: Response) => {
        if(req.query['bypass-cache'] === 'true') FileCache.forget('vendor_slo')

        let data = await FileCache.remember('vendor_slo', (3600 * 24 * 7), async () => {
            return {
                wavesms       : (await prisma.$queryRaw`SELECT ROUND(SUM(CASE WHEN status = 'COMPLETED' THEN 1 END) / COUNT(*) * 100) AS slo
                                                        FROM notifiables
                                                        WHERE provider = ${Provider.WAVESMS};` as SLOResult)[0].slo,
                websms        : (await prisma.$queryRaw`SELECT ROUND(SUM(CASE WHEN status = 'COMPLETED' THEN 1 END) / COUNT(*) * 100) AS slo
                                                        FROM notifiables
                                                        WHERE provider = ${Provider.WEBSMS};` as SLOResult)[0].slo,
                africastalking: (await prisma.$queryRaw`SELECT ROUND(SUM(CASE WHEN status = 'COMPLETED' THEN 1 END) / COUNT(*) * 100) AS slo
                                                        FROM notifiables
                                                        WHERE provider = ${Provider.AT};` as SLOResult)[0].slo
            };
        });

        return res.send(this.successResponse(data));
    };
}
