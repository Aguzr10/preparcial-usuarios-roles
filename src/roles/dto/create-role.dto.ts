import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  // class-validator revisa de abajo hacia arriba: primero que exista, luego el largo
  @ApiProperty({ example: 'supervisor' })
  @MaxLength(50, { message: 'role_name debe tener máximo 50 caracteres' })
  @IsNotEmpty({ message: 'role_name es requerido' })
  @IsString({ message: 'role_name es requerido' })
  role_name: string;

  @ApiPropertyOptional({ example: 'Revisa el trabajo del equipo' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
