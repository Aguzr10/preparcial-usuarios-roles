import { Module } from '@nestjs/common';
import { ParkingspotsService } from './parkingspots.service.js';
import { ParkingspotsController } from './parkingspots.controller.js';
import { Parkingspot } from './entities/parkingspot.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { Reservation } from '../reservations/entities/reservation.entity.js';
import { Role } from '../roles/entities/role.entity.js';

@Module({
  controllers: [ParkingspotsController],
  providers: [ParkingspotsService],
  imports: [TypeOrmModule.forFeature([Parkingspot, User, Reservation, Role])],
})
export class ParkingspotsModule {}
