import { Notification } from '../models/Notification';
import { log } from '../utils/logger';
import { Channel } from '../utils/enums';
import { Mail } from '../channels/mail';
import SMS from '../channels/sms';
import Slack from '../channels/slack';
import { Help } from '../utils/helpers';
import { BadRequestError } from '../exceptions/bad-request.err';
import { NotFoundError } from '../exceptions/not-found.err';

export default class NotificationRepository {
    static index = async (withRelations?: string) => {
        const relations = withRelations.split(',');

        try {
            return await Notification.find({
                relations: { notifiables: relations.includes('notifiables') }, order: { id: 'DESC' },
                select   : ['id', 'event_type', 'content', 'channel', 'destination', 'status', 'created_at']
            });
        } catch (err) {
            log.error(err);
            throw new BadRequestError('Unable to fetch notifications!');
        }
    }

    static show = async (id:number, withRelations?: string) => {
        const relations = withRelations.split(',');

        console.log(relations);

        const notification = await Notification.findOne({
            where: { id }, relations: { notifiables: relations.includes('notifiables') }
        });

        if (!notification) throw new NotFoundError('Notification Not Found!');

        return notification
    }

    static store = async (channel, content, event_type, destinations) => {
        log.info(`CREATE ${channel} NOTIFICATION for ${event_type}`);

        if (channel === Channel.SLACK) destinations = ['Sidooh'];
        if (!Array.isArray(destinations)) destinations = [destinations];

        const notifications = Notification.create(destinations.map(destination => ({
            channel, destination, content, event_type
        })));

        await Notification.insert(notifications);

        this.send(channel, notifications);

        return notifications;
    };

    static send = async (channel: Channel, notifications: Notification[]): Promise<void | boolean> => {
        const destinations = notifications.map(n => n.destination);

        log.info(`SEND ${channel} NOTIFICATION to ${destinations.join(',')}`);

        let channelService;
        if (channel === Channel.MAIL) {
            channelService = new Mail(notifications);
        } else if (channel === Channel.SMS) {
            channelService = new SMS(notifications, destinations, await Help.getSMSSettings());
        } else {
            channelService = new Slack(notifications);
        }

        await channelService.send();
    };
}