import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, JoinTable, JoinColumn, } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Parkingspot } from '../../parkingspots/entities/parkingspot.entity.js';
import { ManyToOne } from 'typeorm/browser';

@Entity('reservations')
export class Reservation {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User,  { nullable: true , onDelete: 'CASCADE' })
    @JoinColumn({ name: 'users_id' })
    id_user: User | null;

    @ManyToOne(() => Parkingspot,  { nullable: true , onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parkingspots_id' })
    id_spot: Parkingspot | null;

    @CreateDateColumn({ type: 'date', nullable:true})
    date: Date | null;

    @Column({type: 'varchar', nullable:true, default: 'ABC123' })
    vehicle_plate: string | null;
    
    @Column({type: 'enum', enum: ['standard', 'ultra_fast', 'fast'], nullable:true })   
    vehicle_max_charge: 'standard' | 'ultra_fast' | 'fast';

    @Column({type: 'enum', enum: ['pending', 'completed', 'cancelled'], nullable:true, default: 'pending' })
    status: 'pending' | 'completed' | 'cancelled';

    @CreateDateColumn({ type: 'timestamp' , default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    















}
