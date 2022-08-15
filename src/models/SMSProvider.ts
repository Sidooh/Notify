import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ENV, Provider, Status } from '../utils/enums';

@Entity('sms_providers')
export class SMSProvider extends BaseEntity {
    @Column({ length: 50 })
    name: Provider.WEBSMS | Provider.AT;

    @Column({ type: 'tinyint' })
    priority: 1 | 2;

    @Column({ length: 20 })
    environment: ENV;

    @Column({ length: 20, default: Status.ACTIVE })
    status: Status;
}
