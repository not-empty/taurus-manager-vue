import { Exclude } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("user")
class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  login: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  role: string;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: "deleted_at",
  })
  deletedAt: Date;

  @DeleteDateColumn({
    name: "allow_all",
  })
  @Column({
    name: "allow_all",
  })
  allowAll: number;

  @Column()
  groups: string;
}

export default User;
