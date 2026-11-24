
import { CreateParkingspotDto } from './dto/create-parkingspot.dto.js';
import { UpdateParkingspotDto } from './dto/update-parkingspot.dto.js';



import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import {Parkingspot} from '../parkingspots/entities/parkingspot.entity.js';


@Injectable()
export class ParkingspotsService {
 



}
