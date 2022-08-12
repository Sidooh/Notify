import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Channel, EventType, Status } from '../utils/enums';
import { Notifiable } from './Notifiable';

@Entity('notifications')
export class Notification extends BaseEntity {

    @Column({ length: 20 })
    channel: Channel;

    @Column({ length: 50 })
    destination: string;

    @Column({ length: 50, default: EventType.DEFAULT })
    event_type: EventType;

    @Column({ type: 'text' })
    content: string;

    @Column({ default: Status.PENDING })
    status: Status;

    @OneToMany(() => Notifiable, notifiable => notifiable.notification)
    notifiables: Notifiable[];
}