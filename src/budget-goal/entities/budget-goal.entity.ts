import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne
  } from 'typeorm';
  import { User } from '../../user/entities/user.entity'; // adjust this path based on your project
  
  @Entity('budget_goals')
  export class BudgetGoal {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;
    
  
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    goalAmount: number;
  
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    remainingAmount: number;
  
    @Column({ type: 'date' })
    startDate: Date;
  
    @Column({ type: 'date' })
    endDate: Date;
  
    @Column({ type: 'enum', enum: ['active', 'expired', 'over-budget', 'under-budget' ,'deleted'], default: 'active' })
    status: 'active' | 'expired' | 'over-budget' | 'under-budget' | 'deleted';
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  