import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import Queue from "../../queue/entities/Queue";

@Entity("group")
class Group {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

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

  @OneToMany(() => Queue, (queue) => queue.group)
  queues: Queue[];
}

export default Group;
