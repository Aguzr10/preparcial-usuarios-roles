// NO TOCAR · Body del login.
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

// Sin @IsEmail ni largo mínimo: con datos malos el login responde 401, no 400,
// así no le da pistas a quien prueba contraseñas.
export class LoginDto {
  @ApiProperty({ example: 'admin@admin.com' })
  @IsNotEmpty({ message: 'Credenciales incorrectas' })
  @IsString({ message: 'Credenciales incorrectas' })
  email: string;

  @ApiProperty({ example: 'webparcial2611' })
  @IsNotEmpty({ message: 'Credenciales incorrectas' })
  @IsString({ message: 'Credenciales incorrectas' })
  password: string;
}
