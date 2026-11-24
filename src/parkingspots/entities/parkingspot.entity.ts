import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, JoinTable, ManyToOne, JoinColumn, OneToMany, } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { ManyToMany } from 'typeorm/browser';
import { Reservation } from '../../reservations/entities/reservation.entity.js';


@Entity('parkingspots')
export class Parkingspot {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', unique: true, nullable: true })
    code: string;

    @Column({enum: ['standard', 'ultra_fast', 'fast'], type: 'enum', nullable: true })
    charger_type: 'standard' | 'ultra_fast' | 'fast';

    @OneToMany(() => Reservation, (reservation) => reservation.id_spot, { nullable: true , onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parkingspots_id' })
    reservations: Reservation[] | null;

    @CreateDateColumn({ type: 'timestamp' , default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @ManyToOne(() => User,  { nullable: true , onDelete: 'CASCADE' })
    @JoinColumn({ name: 'users_id' })
    id_user: User | null;

}
