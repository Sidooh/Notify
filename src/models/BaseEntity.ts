import { BaseEntity as OrmBaseEntity, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity extends OrmBaseEntity {
    @PrimaryGeneratedColumn({ type: process.env.NODE_ENV === 'test' ? 'integer' : 'bigint', unsigned: true })
    id: number;

    @CreateDateColumn({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', nullable: true })
    created_at: Date;

    @CreateDateColumn({ type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamp', nullable: true })
    updated_at: Date;
}