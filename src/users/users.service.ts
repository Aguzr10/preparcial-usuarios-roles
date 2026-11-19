import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordHasher } from '@nestjs/authentication';
import { In, QueryFailedError, Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto.js';
import { Role } from '../roles/entities/role.entity.js';
import { AssignRolesDto } from './dto/assign-roles.dto.js';
import { User } from './entities/user.entity.js';

// Código de Postgres para "viola una restricción UNIQUE"
const UNIQUE_VIOLATION = '23505';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    // Lo trae AuthenticationModule (scrypt): se inyecta como cualquier servicio
    private readonly hasher: PasswordHasher,
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

  // POST /auth/register → crea el usuario SIN roles (los asigna un admin)
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.userRepo.existsBy({ email })) {
      throw new ConflictException('Email ya registrado');
    }

    try {
      const user = await this.userRepo.save(
        this.userRepo.create({
          email,
          password: await this.hasher.hash(dto.password), // se guarda el hash, nunca la contraseña
          name: dto.name ?? null,
          phone: dto.phone ?? null,
        }),
      );
      return { message: 'Usuario registrado con éxito', userId: user.id };
    } catch (error) {
      // Dos registros al tiempo con el mismo correo: el UNIQUE de la base frena el segundo
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
      ) {
        throw new ConflictException('Email ya registrado');
      }
      throw error;
    }
  }

  // POST /auth/login → el usuario si correo y contraseña coinciden, si no null
  async verifyCredentials(email: string, password: string) {
    const user = await this.userRepo.findOneBy({
      email: email.trim().toLowerCase(),
    });
    // Con correo inexistente se compara contra un hash falso (undefined):
    // tarda lo mismo, así el tiempo de respuesta no revela qué correos existen
    const valid = await this.hasher.verify(password, user?.password);
    return user && valid ? user : null;
  }

  // Usuario con sus roles, o null. Lo usa JwtAuth en cada petición con token.
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
