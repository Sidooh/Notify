import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Status } from '../utils/enums';
import { PolymorphicParent } from 'typeorm-polymorphic';
import { Notification } from './Notification';

@Entity('websms_callbacks')
export class WebsmsCallback extends BaseEntity {

    @Column({ nullable: true })
    message_id: string;

    @Column({ length: 15, nullable: true })
    phone: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: Status.PENDING })
    status: Status;

    @Column({ type: 'integer', nullable: true })
    status_code: number;

    @Column({ type: 'bigint', unsigned: true })
    notification_id: number;

    @PolymorphicParent(() => Notification)
    notification: Notification;

}
