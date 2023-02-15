import { BaseEntity as OrmBaseEntity, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { env } from '../utils/validate.env';

export abstract class BaseEntity extends OrmBaseEntity {
    @PrimaryGeneratedColumn({ type: env.NODE_ENV === 'test' ? 'integer' : 'bigint', unsigned: true })
    id: number;

    @CreateDateColumn({ type: env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', nullable: true })
    created_at: Date;

    @CreateDateColumn({ type: env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', nullable: true })
    updated_at: Date;
}