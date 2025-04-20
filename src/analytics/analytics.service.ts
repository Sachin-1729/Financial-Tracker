import { Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Injectable()
export class AnalyticsService {
  
    constructor(
      @InjectRepository(Transaction)
      private transactionRepository: Repository<Transaction>,
    ) {}


    // analytics.service.ts

async getTotalIncomeAndExpenseForToday(userId: string) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Starting from 12:00 AM
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Ending at 11:59 PM

  // Fetch total income for today
  const income = await this.transactionRepository
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalIncome')
    .where('transaction.userId = :userId', { userId })
    .andWhere('transaction.type = :type', { type: 'income' })
    .andWhere('transaction.date BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
    .getRawOne();

  // Fetch total expense for today
  const expense = await this.transactionRepository
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalExpense')
    .where('transaction.userId = :userId', { userId })
    .andWhere('transaction.type = :type', { type: 'expense' })
    .andWhere('transaction.date BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
    .getRawOne();

  return {
    totalIncome: income.totalIncome || 0,
    totalExpense: expense.totalExpense || 0,
    cashFlow: income.totalIncome - expense.totalExpense, // Cash flow calculation
  };
}

  
  create(createAnalyticsDto: CreateAnalyticsDto) {
    return 'This action adds a new analytics';
  }

  // analytics.service.ts

async getTransactionsBetweenDates(userId: string, startDate: Date, endDate: Date) {
  const transactions = await this.transactionRepository
    .createQueryBuilder('transaction')
    .where('transaction.userId = :userId', { userId })
    .andWhere('transaction.date BETWEEN :startDate AND :endDate', { startDate, endDate })
    .orderBy('transaction.date', 'DESC')
    .getMany();
  
  return transactions;
}

// analytics.service.ts

// analytics.service.ts

async getLastWeekTransactions(userId: string, type: 'income' | 'expense') {
  const today = new Date();

  // Indian Standard Time (IST) is UTC +5:30
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds

  // Get the day of the week (Sunday = 0, Monday = 1, etc.)
  const dayOfWeek = today.getDay();

  // Calculate the start and end of last week in local time
  const startOfLastWeek = new Date(today);
  startOfLastWeek.setDate(today.getDate() - dayOfWeek - 7); // Start of last week
  const endOfLastWeek = new Date(today);
  endOfLastWeek.setDate(today.getDate() - dayOfWeek - 1); // End of last week

  // Reset time for start and end of last week to start from midnight and end at 11:59:59
  startOfLastWeek.setHours(0, 0, 0, 0); // Midnight (start of day)
  endOfLastWeek.setHours(23, 59, 59, 999); // End of the day

  // Adjust to IST (UTC +5:30) by adding the IST offset to the start and end of the week
  const istStartOfLastWeek = new Date(startOfLastWeek.getTime() + IST_OFFSET);
  const istEndOfLastWeek = new Date(endOfLastWeek.getTime() + IST_OFFSET);

  // Log start and end dates in IST using toLocaleString
  console.log('Start of Last Week (IST):', istStartOfLastWeek.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  console.log('End of Last Week (IST):', istEndOfLastWeek.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

  // Fetch the transactions for last week
  const transactions = await this.transactionRepository
    .createQueryBuilder('transaction')
    .where('transaction.userId = :userId', { userId })
    .andWhere('transaction.type = :type', { type })
    .andWhere('transaction.date >= :startOfLastWeek', {
      startOfLastWeek: istStartOfLastWeek,
    })
    .andWhere('transaction.date <= :endOfLastWeek', {
      endOfLastWeek: istEndOfLastWeek,
    })
    .orderBy('transaction.date', 'DESC') // Sorting the results in descending order
    .getMany();

  return transactions;
}



// analytics.service.ts

async getLast30DaysTransactions(userId: string, type: 'income' | 'expense') {
  const today = new Date();

  // Calculate the date 30 days ago from today
  const startOfLast30Days = new Date(today);
  startOfLast30Days.setDate(today.getDate() - 30); // Set it to 30 days ago
  startOfLast30Days.setHours(0, 0, 0, 0); // Set to the start of the day (midnight)

  // Today's date is the end of the range, so set it to the current time
  const endOfLast30Days = new Date(today);
  endOfLast30Days.setHours(23, 59, 59, 999); // Set to the end of the day (11:59:59.999 PM)

  // Log start and end dates for debugging
  console.log('Start of Last 30 Days:', startOfLast30Days.toLocaleDateString());
  console.log('End of Last 30 Days:', endOfLast30Days.toLocaleDateString());

  // Fetch the transactions for the last 30 days
  const transactions = await this.transactionRepository
    .createQueryBuilder('transaction')
    .where('transaction.userId = :userId', { userId })
    .andWhere('transaction.type = :type', { type })
    .andWhere('transaction.date >= :startOfLast30Days', {
      startOfLast30Days,
    })
    .andWhere('transaction.date <= :endOfLast30Days', {
      endOfLast30Days,
    })
    .orderBy('transaction.date', 'DESC') // Sorting the results in descending order
    .getMany();

  return transactions;
}







// analytics.service.ts

async getTodayTotalIncomeExpense(userId: string) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Starting from 12:00 AM
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // Ending at 11:59 PM

  const income = await this.transactionRepository
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalIncome')
    .where('transaction.userId = :userId', { userId })
    .andWhere('transaction.type = :type', { type: 'income' })
    .andWhere('transaction.date BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
    .getRawOne();

  const expense = await this.transactionRepository
    .createQueryBuilder('transaction')
    .select('SUM(transaction.amount)', 'totalExpense')
    .where('transaction.userId = :userId', { userId })
    .andWhere('transaction.type = :type', { type: 'expense' })
    .andWhere('transaction.date BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
    .getRawOne();

  return {
    totalIncome: income.totalIncome || 0,
    totalExpense: expense.totalExpense || 0,
    cashFlow: income.totalIncome - expense.totalExpense,
  };
}



  findAll() {
    return `This action returns all analytics`;
  }

  findOne(id: number) {
    return `This action returns a #${id} analytics`;
  }

  update(id: number, updateAnalyticsDto: UpdateAnalyticsDto) {
    return `This action updates a #${id} analytics`;
  }

  remove(id: number) {
    return `This action removes a #${id} analytics`;
  }


  async getLast30DaysTotalIncomeExpense(userId: string) {
    const today = new Date();
  
    // Calculate the date 30 days ago from today
    const startOfLast30Days = new Date(today);
    startOfLast30Days.setDate(today.getDate() - 30); // Set it to 30 days ago
    startOfLast30Days.setHours(0, 0, 0, 0); // Set to the start of the day (midnight)
  
    // Today's date is the end of the range, so set it to the current time
    const endOfLast30Days = new Date(today);
    endOfLast30Days.setHours(23, 59, 59, 999); // Set to the end of the day (11:59:59.999 PM)
  
    // Log start and end dates for debugging
    console.log('Start of Last 30 Days:', startOfLast30Days.toLocaleDateString());
    console.log('End of Last 30 Days:', endOfLast30Days.toLocaleDateString());
  
    // Fetch total income for the last 30 days
    const income = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'totalIncome')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: 'income' })
      .andWhere('transaction.date >= :startOfLast30Days', {
        startOfLast30Days,
      })
      .andWhere('transaction.date <= :endOfLast30Days', {
        endOfLast30Days,
      })
      .getRawOne();
  
    // Fetch total expense for the last 30 days
    const expense = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'totalExpense')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.type = :type', { type: 'expense' })
      .andWhere('transaction.date >= :startOfLast30Days', {
        startOfLast30Days,
      })
      .andWhere('transaction.date <= :endOfLast30Days', {
        endOfLast30Days,
      })
      .getRawOne();
  
    // Calculate cash flow
    const totalIncome = income.totalIncome || 0;
    const totalExpense = expense.totalExpense || 0;
    const cashFlow = totalIncome - totalExpense;
  
    // Return the total income, total expense, and cash flow
    return {
      totalIncome,
      totalExpense,
      cashFlow,
    };
  }
  
}
