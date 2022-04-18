import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { EventType, Provider, Status } from '../utils/enums';
import { ATCallback } from './ATCallback';
import { WebsmsCallback } from './WebsmsCallback';
import { PolymorphicChildren } from 'typeorm-polymorphic';

@Entity('notifications')
export class Notification extends BaseEntity {

    @Column({ length: 20 })
    channel: string;

    @Column({ length: 50 })
    destination: string;

    @Column({ length: 50, default: EventType.DEFAULT })
    event_type: EventType;

    @Column({ type: 'text' })
    content: string;

    @Column({ nullable: true })
    provider: Provider;

    @Column({ default: Status.PENDING })
    status: Status;

    @PolymorphicChildren(() => [ATCallback, WebsmsCallback])
    notifiables: (ATCallback | WebsmsCallback)[];

}
