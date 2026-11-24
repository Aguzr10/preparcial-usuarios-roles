import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, JoinTable, ManyToOne, JoinColumn, } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { ManyToMany } from 'typeorm/browser';


@Entity('parkingspots')
export class Parkingspot {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', unique: true, nullable: true })
    code: string;

    @Column({enum: ['standard', 'ultra_fast', 'fast'], type: 'enum', nullable: true })
    charger_type: 'standard' | 'ultra_fast' | 'fast';

    @ManyToOne(() => User,  { nullable: true , onDelete: 'CASCADE' })
    @JoinColumn({ name: 'users_id' })
    usuario: User | null;

    @CreateDateColumn({ type: 'timestamp' , default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;


}
