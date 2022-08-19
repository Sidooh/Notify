import { Notification } from '../models/Notification';
import { log } from '../utils/logger';
import { Channel } from '../utils/enums';
import { BadRequestError } from '../exceptions/bad-request.err';

export default class SmsRepository {
    static index = async (withRelations?: string) => {
        const relations = withRelations.split(',');

        try {
            return await Notification.find({
                select   : ['id', 'event_type', 'content', 'channel', 'destination', 'status', 'created_at'],
                where    : { channel: Channel.SMS },
                relations: { notifiables: relations.includes('notifiables') }, order: { id: 'DESC' }
            });
        } catch (err) {
            log.error(err);
            throw new BadRequestError('Unable to fetch notifications!');
        }
    };
}