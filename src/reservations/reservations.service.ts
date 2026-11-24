
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity.js';
import {Parkingspot} from '../parkingspots/entities/parkingspot.entity.js';


@Injectable()
export class ReservationsService {  

  //un vehiculo no puede reservar un puesto con mas potencia de carga que la que soporta su vehiculo, por lo que se debe validar que el tipo de carga del puesto sea menor o igual al tipo de carga del vehiculo.
  //un puesto no puede tener dos reservas vigentes(no canceladas) el mismo dia, y no se puede reservar en fechas pasadas
  //no puede reservar fechas pasadas  

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Parkingspot)
    private readonly parkingspotRepository: Repository<Parkingspot>,
  ) {}

  // POST /reservations (solo conductor) 201 de exito, de error 400, 401, 403, 409
  async create(createReservationDto: CreateReservationDto): Promise<Reservation[]> {  
    const item  = { await. this.repo.findOneBy:
      id_spot: createReservationDto.reservation_date,
      reserved_spot_id: createReservationDto.reserved_spot_id,
      canceled: false,

  //listar reservas GET solo conductor, supervisor ver las reservas de opuestos que supervisan y admin ver todas reservas
    findAll(): Promise<Reservation[]> {
      return this.reserved_spot_id.findOne({});

  // actualizar estado reserva PATCH 200 solo supervisor
    async update(id_spot, updateReservationDto: UpdateReservationDto) {
      const reservation = await this.findOne(this.id_spot
        if (dto.name) {
          reservation.name = dto.name;
        }
      Object.assign(reservation, dto);
      return this.reservation.save(reservation);

      }
    }
  }
  }
}


// DELETE /reservas
async remove(id: number): Promise<void> {
  const reservation = await this.findOne(id);
  const Parkingspot = await this.parkingspotRepository.findOne({ where: { id: reservation.reserved_spot_id } });

  if (!reservation) {
    throw new NotFoundException('Reservation not found');

  }
  return this.reservationRepository.remove(reservation);
}
