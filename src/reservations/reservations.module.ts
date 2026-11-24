import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { ReservationsController } from './reservations.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { Parkingspot } from '../parkingspots/entities/parkingspot.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../roles/entities/role.entity.js';


@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService],
  imports: [TypeOrmModule.forFeature([Reservation, Parkingspot, User, Role])],
})
export class ReservationsModule {}
