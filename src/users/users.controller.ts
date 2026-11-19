import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { UserPolicy } from './user.policy.js';
import { AssignRolesDto } from './dto/assign-roles.dto.js';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@ApiBearerAuth() // Swagger manda el token del botón "Authorize"
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me · autenticado
  // 200 { id, email, name, phone, roles } | 401 Token inválido o faltante | 404 Usuario no encontrado
  // Va ANTES de cualquier ruta con :id, para que "me" no se lea como un id
  @Can.Anyone() // cualquiera con token (sin token, 401 del guard de autenticación)
  @Get('me')
  findMe(@CurrentUser() user: User) {
    return this.usersService.findProfile(user.id);
  }

  // GET /users · admin
  // 200 [{ id, email, name, roles }] | 401 | 403 | 500 Error al listar usuarios
  @Can(UserPolicy, 'list')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // PATCH /users/:id/roles · admin · body { roles: ["admin", "supervisor"] }
  // 200 { message: "Roles asignados" } | 400 roles inválidos | 401 | 403 | 404 Usuario no encontrado
  // ParseUUIDPipe: si el id no es un uuid, 400 antes de tocar la base
  @Can(UserPolicy, 'assignRoles')
  @Patch(':id/roles')
  assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRolesDto,
  ) {
    return this.usersService.assignRoles(id, dto);
  }
}
