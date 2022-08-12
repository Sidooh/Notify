import { Notification } from '../models/Notification';
import map from 'lodash/map';
import { log } from '../utils/logger';
import { Channel } from '../utils/enums';
import { Mail } from '../channels/mail';
import SMS from '../channels/sms';
import Slack from '../channels/slack';
import { Help } from '../utils/helpers';

export default class NotificationRepository {
    static store = async (channel, content, event_type, destination) => {
        log.info(`CREATE ${channel} NOTIFICATION for ${event_type}`);

        if (channel === Channel.SLACK) destination = ['Sidooh'];

        const notifications = Notification.create(destination.map(destination => ({
            channel, destination, content, event_type
        })));

        await Notification.insert(notifications);

        this.send(channel, notifications);

        return notifications;
    };

    static send = async (channel: Channel, notifications: Notification[]): Promise<void | boolean> => {
        const destinations = map(notifications, 'destination');

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