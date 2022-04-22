import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity('settings')
export class Setting extends BaseEntity {

    @Column()
    type: string;

    @Column()
    value: string;

}
