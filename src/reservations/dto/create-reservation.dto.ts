import { ApiProperty } from '@nestjs/swagger';

import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';


export class CreateReservationDto {

    //un condcutor reserva un puesto para una fecha, indicando la placa y el tipo de carga mas potentente que soporta su vehiuclo.
    @ApiProperty({
        description: 'The plate of the vehicle',
        example: 'ABC123',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    vehicle_plate: string;

    @ApiProperty({
        description: 'The maximum charge level of the vehicle',
        example: 'standard',
        enum: ['standard', 'ultra_fast', 'fast'],
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    vehicle_max_charge: 'standard' | 'ultra_fast' | 'fast';

    @ApiProperty({
        description: 'The date of the reservation',
        example: '2023-06-15',
    })
    @IsString()
    @IsNotEmpty()
    reservation_date: string;


    //un vehiculo no puede reservar un puesto con mas potencia de carga que la que soporta su vehiculo, por lo que se debe validar que el tipo de carga del puesto sea menor o igual al tipo de carga del vehiculo.
    @ApiProperty({
        description: 'The charge level of the reserved spot',
        example: 'standard',
        enum: ['standard', 'ultra_fast', 'fast'],
        // if the reserved spot charge level is higher than the vehicle max charge level, the reservation will be rejected.
        // This validation is done in the service layer.
    })
    @IsString()
    @IsNotEmpty()
    reserved_spot_charge: 'standard' | 'ultra_fast' | 'fast';


    //un puesto no puede tener dos reservas vigentes(no canceladas) el mismo dia, y no se puede reservar en fechas pasadas
    @ApiProperty({
        description: 'The ID of the reserved spot',
        example: 1,
    })
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    reserved_spot_id: number;
    //no puede reservar fechas pasadas 
    // This validation is done in the service layer.





}
