import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UnauthorizedException, UseGuards, BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from '../interface/request.user.interface'; 
import * as moment from 'moment';
import { JwtAuthGuard } from 'src/guard/auth.guard';

@ApiTags('analytics') // Tag for grouping in Swagger
@ApiBearerAuth() 
@Controller('analytics')
@UseGuards(JwtAuthGuard)

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}


  @Get('transactions-between-dates')
  @ApiOperation({ summary: 'Get transactions between two dates' })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: 'Start date in format YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: 'End date in format YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Transactions fetched successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getTransactionsBetweenDates(
    @Request() req: RequestWithUser, // Use the defined interface for the request
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!req?.user) {
      // If user is not authenticated, throw an error
      throw new UnauthorizedException('User not authenticated');
    }

    const userId = req.user.id;

    // Convert string date to Date object using moment.js to ensure proper formatting and comparison
  const start = moment(startDate, 'YYYY-MM-DD', true);  // Strict format validation
  const end = moment(endDate, 'YYYY-MM-DD', true);      // Strict format validation


  // Check if both start and end dates are valid
  if (!start.isValid() || !end.isValid()) {
    throw new BadRequestException('Invalid date format. Please use YYYY-MM-DD.');
  }
  end.endOf('day'); // Ensures that the end date includes the full day
    // Call the service method to get transactions
    // Call the service method to get transactions
  return this.analyticsService.getTransactionsBetweenDates(String(userId), start.toDate(), end.toDate());
  }











  @Get('last-week-transactions')
  @ApiOperation({ summary: 'Get transactions for last week' })
  @ApiQuery({ name: 'type', required: true, enum: ['income', 'expense'], description: 'Transaction type' })
  @ApiResponse({ status: 200, description: 'Transactions for last week fetched successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getLastWeekTransactions(
    @Request() req: RequestWithUser, // Extract the request object
    @Query('type') type: 'income' | 'expense',
  ) {
  
    const userId = req?.user?.id; // Access userId from req.user
    return this.analyticsService.getLastWeekTransactions(String(userId), type);
  }

  @Get('last-month-transactions')
  @ApiOperation({ summary: 'Get transactions for last month' })
  @ApiQuery({ name: 'type', required: true, enum: ['income', 'expense'], description: 'Transaction type' })
  @ApiResponse({ status: 200, description: 'Transactions for last month fetched successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getLastMonthTransactions(
    @Request() req: RequestWithUser, // Extract the request object
    @Query('type') type: 'income' | 'expense',
  ) {
    const userId = req.user.id; // Access userId from req.user
    return this.analyticsService.getLast30DaysTransactions(String(userId), type);
  }

  @Get('today-income-expense')
  @ApiOperation({ summary: 'Get total income and total expense for today' })
  @ApiResponse({ status: 200, description: 'Total income and expense for today fetched successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getTotalIncomeAndExpenseForToday(
    @Request() req: RequestWithUser, // Extract the request object
  ) {
    const userId = req.user.id; // Access userId from req.user
    return this.analyticsService.getTotalIncomeAndExpenseForToday(String(userId));
  }
  @Get('last-30-days/:userId')
  @ApiOperation({
    summary: 'Get total income, total expense, and cash flow for the last 30 days',
    description: 'Fetch the total income, total expense, and cash flow for the last 30 days for a specific user.',
  })
  @ApiResponse({
    status: 200,
    description: 'The total income, total expense, and cash flow for the last 30 days.',

  })
  @ApiResponse({
    status: 404,
    description: 'User not found or no transactions in the last 30 days.',
  })
  async getLast30DaysTotalIncomeExpense(
    @Request() req: RequestWithUser, // Extract the request object
  ){
    const userId = req.user.id; // Access userId from req.user
    return await this.analyticsService.getLast30DaysTotalIncomeExpense(String(userId),);
  }
 

}
