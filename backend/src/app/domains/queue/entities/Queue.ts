import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Group from '../../group/entities/Group';
import { QueueJobCounts, QueueStatus } from '../../../providers/QueueProvider/types';
@Entity('queue')
class Queue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  compliance: string;

  @Column()
  host: string;

  @Column()
  port: number;

  @Column({
    name: 'group_id',
  })
  groupId: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt: Date;

  @Column()
  health_value: number;

  @ManyToOne(() => Group, (group) => group.queues)
  @JoinColumn({
    name: 'group_id',
  })
  group: Group;

  status: QueueStatus;

  jobCounts: QueueJobCounts;
}

export default Queue;
