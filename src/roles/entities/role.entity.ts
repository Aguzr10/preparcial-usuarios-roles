import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Tabla roles. Debe coincidir con la migración CreateUsersAndRoles.
// No conoce a los usuarios: la relación muchos a muchos se declara solo en User.
@Entity('roles')
export class Role {
  // uuid y no número: los ids no se pueden adivinar (/roles/1, /roles/2...)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Mismo nombre que la columna: el JSON sale como pide el enunciado (role_name)
  @Column({ type: 'varchar', length: 50, unique: true })
  role_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;
}
