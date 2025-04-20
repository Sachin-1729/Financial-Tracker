import { Injectable } from '@nestjs/common';
import { CreateBudgetGoalDto } from './dto/create-budget-goal.dto';
import { UpdateBudgetGoalDto } from './dto/update-budget-goal.dto';
import { ConflictException } from '@nestjs/common';
import {eventEmitter} from "../common/event-emitter"
import { InjectRepository } from '@nestjs/typeorm';
import { BudgetGoal } from './entities/budget-goal.entity';
import { Repository , LessThanOrEqual, MoreThanOrEqual, In, Not, LessThan } from 'typeorm';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { Between } from 'typeorm';


@Injectable()
export class BudgetGoalService {
  constructor(
    @InjectRepository(BudgetGoal)
    private readonly goalRepository: Repository<BudgetGoal>, 
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,


  ) {
    eventEmitter.on('transaction.created', this.updateBudgetGoal.bind(this));
    eventEmitter.on('transaction.updated', this.recalculateGoals.bind(this));
    eventEmitter.on('transaction.deleted', this.recalculateGoals.bind(this));
  }

  async recalculateGoals(transaction) {
    const { userId } = transaction;
    const today = new Date();
  
    // Find the current goal
    const goal = await this.goalRepository.findOne({
      where: {
        user: { id: userId },
        status: In(['active', 'over-budget', 'under-budget']),
        startDate: LessThanOrEqual(today),
        endDate: MoreThanOrEqual(today),
      },
      relations: ['user'],
    });
  
    if (!goal) {
      console.log('No active goal found for user');
      return;
    }
  
    // Get all transactions during this goal period
    const allTransactions = await this.transactionRepository.find({
      where: {
        user: { id: userId },
        createdAt: Between(goal.startDate, goal.endDate),
      },
    });
  
    // Recalculate remainingAmount from scratch
    let totalChange = 0;

    for (const txn of allTransactions) {
      const amount = typeof txn.amount === 'string' ? parseFloat(txn.amount) : txn.amount;
      if (isNaN(amount)) {
        console.warn('Invalid txn amount:', txn.amount);
        continue;
      }
    
      if (txn.type === 'expense') {
        totalChange -= amount;
      } else if (txn.type === 'income') {
        totalChange += amount;
      }
    }
    
    const goalAmount = typeof goal.goalAmount=== 'string' ? parseFloat(goal.goalAmount) : goal.goalAmount; // safely convert string to number
    const rawRemaining = goalAmount + totalChange;
    const roundedRemaining = Math.round(rawRemaining * 100) / 100;
    
    goal.remainingAmount = roundedRemaining;
    
    console.log({
      goalAmount,
      totalChange,
      rawRemaining,
      rounded: roundedRemaining,
    });
    
    console.log('Goal updated:', goal);    
    
    // Update status
    if (goal.remainingAmount > 0) {
      goal.status = 'active';
    } else if (goal.remainingAmount === 0) {
      goal.status = 'active';
    } else {
      goal.status = 'over-budget';
    }
  
    const now = new Date();
    if (now > goal.endDate) {
      goal.status = goal.remainingAmount <= 0 ? 'over-budget' : 'under-budget';
    }
  
    await this.goalRepository.save(goal);
  }
  

  async updateBudgetGoal(transaction) {
    console.log('Transaction data received:', transaction);
  
    const { userId, amount, type, createdAt } = transaction; // Extract the transaction details
    const transactionDate = createdAt ? new Date(createdAt) : new Date();
  
    // Find the corresponding budget goal for this user, including over-budget goals
    const goal = await this.goalRepository.findOne({
      where: {
        user: { id: userId },
        status: In(['active', 'over-budget', 'under-budget']), // Allow both active and over-budget goals to be fetched
        startDate: LessThanOrEqual(transactionDate),
        endDate: MoreThanOrEqual(transactionDate),
      },
      relations: ['user'], // Ensure 'user' relation is loaded
    });
  
    if (!goal) {
      console.log('No active or over-budget goal found for this user.');
      return;
    }
  
    // Ensure both remainingAmount and amount are treated as numbers
    goal.remainingAmount = Number(goal.remainingAmount);
    const transactionAmount = Number(amount);
  
    // Log before update
    console.log('Before update: goal.remainingAmount', goal.remainingAmount);
    console.log('Transaction amount:', transactionAmount);
  
    // Update the remaining amount based on the transaction type
    if (type === 'expense') {
      goal.remainingAmount -= transactionAmount; // Deduct from goal for expenses
    } else if (type === 'income') {
      goal.remainingAmount += transactionAmount; // Add to goal for income
    }
  
    // Round the remaining amount after update to avoid floating-point precision issues
    goal.remainingAmount = Math.round(goal.remainingAmount * 100) / 100;
  
    // Log after update
    console.log('After update: goal.remainingAmount', goal.remainingAmount);
  
    // Adjust goal status based on remainingAmount
    if (goal.remainingAmount > 0) {
      goal.status = 'active'; // If the goal is under the target, mark it as active
    } else if (goal.remainingAmount === 0) {
      goal.status = 'active'; // Treat 0 as active, meaning the goal has been met
    } else {
      goal.status = 'over-budget'; // If remainingAmount is negative, mark it as over-budget
    }
  
    // Check if the goal is expired (after the goal endDate)
    const today = new Date();
    if (today > goal.endDate) {
      goal.status = goal.remainingAmount <= 0 ? 'over-budget' : 'under-budget';
    }
  
    // Save the updated goal, reflecting the latest remainingAmount and status
    await this.goalRepository.save(goal);
  
    console.log('Goal updated successfully:', goal);
  }
  
  

  async createGoal(userId: number, goalAmount: number) {
    const today = new Date();
  
    // Check if there's an active goal where today is between startDate and endDate
    const activeGoal = await this.goalRepository.findOne({
      where: {
        user: { id: userId },
        startDate: LessThanOrEqual(today),
        endDate: MoreThanOrEqual(today)
      }
    });
  
    if (activeGoal) {
      throw new ConflictException('You already have an active goal in progress.');
    }
  
    const startDate = today;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 30);
  
    const goal = this.goalRepository.create({
      user: { id: userId },
      goalAmount,
      remainingAmount: goalAmount,
      startDate,
      endDate,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  
    return this.goalRepository.save(goal);
  }
  async updateGoal(userId: number, goalId: number, goalAmount: number) {
    // 🎯 Find the specific goal for the user that is not deleted
    const goal = await this.goalRepository.findOne({
      where: {
        id: goalId,
        user: { id: userId },
        status: Not('deleted'), // still keeping it safe, don’t edit deleted goals
      },
    });
  
    if (!goal) {
      throw new Error('Goal not found or already deleted.');
    }
  
    // 💰 Update the goal amount and remaining amount
    goal.goalAmount = goalAmount;
    goal.remainingAmount = goalAmount;
  
    // 🔄 Optional: Re-activate or keep the status logic as is
    goal.status = 'active'; // or keep original status if needed
  
    // 💾 Save it!
    await this.goalRepository.save(goal);
  
    return goal;
  }
  

  async deleteGoal(userId: number, goalId: number) {
    // 🔎 Find the goal by userId and goalId, not already deleted
    const goal = await this.goalRepository.findOne({
      where: {
        id: goalId,
        user: { id: userId },
        status: Not('deleted'),
      },
    });
  
    if (!goal) {
      throw new Error('Goal not found or already deleted.');
    }
  
    // ✅ Optional: Add date-range logic if you want extra validation
    // If not needed, you can skip this part entirely for a simpler version
  
    // 🗑️ Soft delete by changing the status
    goal.status = 'deleted';
  
    await this.goalRepository.save(goal);
  
    console.log('Goal successfully marked as deleted:', goal);
  }
  
  

  async getGoal(userId: number) {
    // Find the goal that is active, over-budget, or under-budget for this user
    const goal = await this.goalRepository.findOne({
      where: {
        user: { id: userId },
        status: Not('deleted'), // Ensure that we are not selecting goals that are already marked as 'deleted'
      },
      relations: ['user'],
    });
  
    if (!goal) {
      throw new Error('No valid goal found for this user or goal is already deleted.');
    }
  
    return goal;
  }

  async updateGoalStatus(goal: BudgetGoal) {
    const today = new Date();
  
    // If the goal's end date has passed
    if (goal.endDate < today) {
      // If the remaining amount is greater than 0, the goal is under-budget
      if (goal.remainingAmount > 0) {
        goal.status = 'under-budget';
      } 
      // If the remaining amount is 0 or less, the goal is over-budget
      else if (goal.remainingAmount <= 0) {
        goal.status = 'over-budget';
      }
      // In case there is no transaction, the goal can be marked as expired
      else {
        goal.status = 'expired';
      }
  
      // Save the updated goal status
      await this.goalRepository.save(goal);
  
      console.log('Goal status updated successfully:', goal);
    }
  }
  
  
  async handleGoalStatus() {
    const today = new Date();
    
    // Get all goals that are not deleted
    const goals = await this.goalRepository.find({
      where: {
        status: Not('deleted'), // Get only active goals
        endDate: LessThan(today), // Only get goals that are expired or about to expire
      },
    });
  
    // Check each goal status and update accordingly
    for (const goal of goals) {
      if (goal.endDate < today) {
        // Update goal status after the month is passed
        await this.updateGoalStatus(goal);
      }
    }
  }

  async viewUserGoals(userId : number) {
    const goals = await this.goalRepository.find({
      where: { user: { id: userId }, status: Not('deleted') },
    });
  
    // Trigger status update only when viewing a goal
    for (const goal of goals) {
      await this.updateGoalStatus(goal); // Ensure status is up-to-date
    }
  
    return goals;
  }
  
  
  
  
  
  
}
