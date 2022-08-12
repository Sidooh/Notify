import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('settings')
export class Setting extends BaseEntity {
    @Column()
    key: string;

    @Column({ type: 'json' })
    value: string;
}
