import { Module } from '@nestjs/common';
import { BudgetGoalService } from './budget-goal.service';
import { BudgetGoalController } from './budget-goal.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetGoal } from './entities/budget-goal.entity';
import { User } from 'src/user/entities/user.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';


@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([BudgetGoal, User , Transaction ])],
  controllers: [BudgetGoalController],
  providers: [BudgetGoalService],
})
export class BudgetGoalModule {}
