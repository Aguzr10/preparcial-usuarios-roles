import { PartialType } from '@nestjs/swagger';
import { CreateParkingspotDto } from './create-parkingspot.dto.js';

export class UpdateParkingspotDto extends PartialType(CreateParkingspotDto) {}
