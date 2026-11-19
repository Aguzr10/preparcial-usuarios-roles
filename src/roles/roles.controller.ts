import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { RolesService } from './roles.service.js';

// El controlador no decide nada: recibe la petición y llama al servicio.
// Las reglas (409, 500...) viven en RolesService.
@ApiTags('roles')
@ApiBearerAuth() // Swagger manda el token del botón "Authorize"
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // POST /roles · admin
  // 201 { message, roleId } | 400 role_name es requerido | 401 | 403 | 409 role_name ya existe
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  // GET /roles · admin
  // 200 [{ id, role_name, description }] | 401 | 403 | 500 Error al obtener roles
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }
}
