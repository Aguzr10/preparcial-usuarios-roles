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


export class CreateParkingspotDto {

    //solo admin crea puestos
    //el puesto tiene un codigo unico, un tipo de cargador, y un supervisor (un usuario con rol supervisor)
    @ApiProperty({
        description: 'The code of the parking spot',
        example: 'SPOT123',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    code: string;   

    @ApiProperty({ 
        description: 'The type of charger for the parking spot',
        example: 'standard',
        enum: ['standard', 'ultra_fast', 'fast'],
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    charger_type: 'standard' | 'ultra_fast' | 'fast';

    @ApiProperty({
        description: 'The ID of the supervisor for the parking spot',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    supervisor_id: string;

        








}
