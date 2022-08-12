import { Column, Entity } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { ENV, Provider } from '../utils/enums';

export interface SettingValue<T> {
    data: T;
}

export interface SMSProvidersSettingValue {
    provider: Provider;
    env: ENV;
    priority: 1 | 2 | 3;
}

@Entity('settings')
export class Setting extends BaseEntity {
    @Column()
    key: string;

    @Column({ type: 'json' })
    value: SettingValue<string> | SettingValue<SMSProvidersSettingValue[]>;
}
