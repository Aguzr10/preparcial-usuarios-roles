// NO TOCAR · Body del registro. Sin campo roles a propósito: nadie se registra como admin.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

// Sin campo roles a propósito: si llega, forbidNonWhitelisted responde 400.
// Si estuviera, cualquiera podría registrarse como admin.
export class RegisterDto {
  @ApiProperty({ example: 'ana@correo.com' })
  @MaxLength(255, { message: 'Email inválido' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  // Mínimo 12 como en la clase: la longitud protege más que exigir símbolos
  @ApiProperty({ example: 'una-clave-larga-123' })
  @Length(12, 64, {
    message: 'password debe tener entre 12 y 64 caracteres',
  })
  @IsString({ message: 'password es requerido' })
  password: string;

  @ApiPropertyOptional({ example: 'Ana Pérez' })
  @IsOptional()
  @MaxLength(100)
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @MaxLength(20)
  @IsString()
  phone?: string;
}
