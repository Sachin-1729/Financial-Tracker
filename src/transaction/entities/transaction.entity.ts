import { Entity, PrimaryGeneratedColumn, Column, ManyToOne ,   CreateDateColumn,
    UpdateDateColumn, } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('float')
  amount: number;

  @Column({ type: 'enum', enum: ['income', 'expense'] })
  type: 'income' | 'expense';

  @Column({ nullable: false })
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => User, { nullable: false, eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
