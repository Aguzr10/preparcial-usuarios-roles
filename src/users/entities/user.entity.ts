// NO BORRAR NI RENOMBRAR CAMPOS · con synchronize: true se borraría la columna y sus datos. Agregar campos nuevos sí se puede (con nullable o default).
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity.js';

// Tabla users. Debe coincidir con la migración CreateUsersAndRoles.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  // Guarda el hash, nunca la contraseña. @Exclude lo saca de toda respuesta.
  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  // false = desactivado: el login responde 423
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Tabla intermedia user_roles (user_id, role_id). Solo este lado conoce la relación.
  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
