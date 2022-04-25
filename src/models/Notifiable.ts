import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Provider, Status } from '../utils/enums';
import { Notification } from './Notification';

@Entity('notifiables')
export class Notifiable extends BaseEntity {

    @Column({ nullable: true })
    provider: Provider;

    @Column({ nullable: true })
    message_id: string;

    @Column({ length: 15, nullable: true })
    phone: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: Status.PENDING })
    status: Status;

    @Column({ type: 'decimal', default: 0, precision: 8, scale: 4 })
    cost?: number;

    @Column({ type: 'integer', nullable: true })
    status_code: number;

    @Column({ type: 'bigint', unsigned: true })
    notification_id: number;

    @ManyToOne(() => Notification, notification => notification.notifiables)
    notification: Notification;

}
