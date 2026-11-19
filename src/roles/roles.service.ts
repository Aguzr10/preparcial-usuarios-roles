import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { Role } from './entities/role.entity.js';

// Código de Postgres para "viola una restricción UNIQUE"
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async create(dto: CreateRoleDto) {
    if (await this.roleRepo.existsBy({ role_name: dto.role_name })) {
      throw new ConflictException('role_name ya existe');
    }

    try {
      const role = await this.roleRepo.save(this.roleRepo.create(dto));
      return { message: 'Rol creado con éxito', roleId: role.id };
    } catch (error) {
      // Dos peticiones al tiempo pueden pasar el existsBy: el UNIQUE de la base las frena
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
      ) {
        throw new ConflictException('role_name ya existe');
      }
      throw error;
    }
  }

  async findAll(): Promise<Role[]> {
    try {
      return await this.roleRepo.find({ order: { role_name: 'ASC' } });
    } catch {
      throw new InternalServerErrorException('Error al obtener roles');
    }
  }
}
