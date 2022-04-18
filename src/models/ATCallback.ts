import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Status } from '../utils/enums';
import { PolymorphicParent } from 'typeorm-polymorphic';
import { Notification } from './Notification';

@Entity('at_callbacks')
export class ATCallback extends BaseEntity {

    @Column({ nullable: true })
    message_id: string;

    @Column({ length: 15, nullable: true })
    phone: string;

    @Column({ nullable: true })
    description: string;

    @Column({type: 'decimal', default: 0})
    cost?: number;

    @Column({ default: Status.PENDING })
    status: Status;

    @Column({ type: 'integer', nullable: true })
    status_code: number;

    @Column({ type: 'bigint', unsigned: true })
    notification_id: number;

    @PolymorphicParent(() => Notification)
    notification: Notification;

}
