import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignRolesDto {
  // De abajo hacia arriba: que sea arreglo, que no esté vacío, que cada uno sea texto
  @ApiProperty({ example: ['admin', 'supervisor'], type: [String] })
  @IsString({ each: true, message: 'roles inválidos' })
  @ArrayNotEmpty({ message: 'roles inválidos' })
  @IsArray({ message: 'roles inválidos' })
  roles: string[];
}
