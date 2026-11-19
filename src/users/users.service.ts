import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity.js';
import { AssignRolesDto } from './dto/assign-roles.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  // GET /users → [{ id, email, name, roles: [...] }]
  async findAll() {
    try {
      const users = await this.userRepo.find({
        relations: { roles: true },
        order: { created_at: 'ASC' },
      });
      return users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((role) => role.role_name),
      }));
    } catch {
      throw new InternalServerErrorException('Error al listar usuarios');
    }
  }

  // GET /users/me → { id, email, name, phone, roles: [...] }
  async findProfile(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      roles: user.roles.map((role) => role.role_name),
    };
  }

  // Usuario con sus roles, o null. Lo va a usar también el login (Fase 5).
  findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: { roles: true },
    });
  }

  // PATCH /users/:id/roles → reemplaza los roles del usuario por los enviados
  async assignRoles(id: string, dto: AssignRolesDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const names = [...new Set(dto.roles)]; // sin repetidos
    const roles = await this.roleRepo.findBy({ role_name: In(names) });

    // Si pidieron un rol que no existe, la base devuelve menos de los pedidos
    if (roles.length !== names.length) {
      throw new BadRequestException('roles inválidos');
    }

    user.roles = roles;
    await this.userRepo.save(user); // TypeORM actualiza user_roles solo
    return { message: 'Roles asignados' };
  }
}
