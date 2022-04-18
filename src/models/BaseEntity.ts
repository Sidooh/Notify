import { BaseEntity as OrmBaseEntity, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity extends OrmBaseEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    created_at: Date;

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    updated_at: Date;
}