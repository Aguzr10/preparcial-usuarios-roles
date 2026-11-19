import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity.js';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { UserPolicy } from './user.policy.js';

@Module({
  // Role también: asignar roles necesita buscar los roles por nombre
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [UsersController],
  providers: [UsersService, UserPolicy],
  exports: [UsersService],
})
export class UsersModule {}
