import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AssignRolesDto } from './dto/assign-roles.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/me se agrega en la Fase 5: necesita saber quién hace la petición (el token)

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/roles')
  assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignRolesDto,
  ) {
    return this.usersService.assignRoles(id, dto);
  }
}
