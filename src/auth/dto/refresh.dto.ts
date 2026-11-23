// NO TOCAR · Body de refresh y logout.
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

// Body de POST /auth/refresh y POST /auth/logout
export class RefreshDto {
  @ApiProperty({ example: 'pega-aqui-el-refreshToken-del-login' })
  @IsNotEmpty({ message: 'refreshToken es requerido' })
  @IsString({ message: 'refreshToken es requerido' })
  refreshToken: string;
}
