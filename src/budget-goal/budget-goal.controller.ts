import { Controller, Post, Body, Param, Get, UseGuards, Patch, Delete ,Request, BadRequestException } from '@nestjs/common';
import { BudgetGoalService } from './budget-goal.service';
import { CreateBudgetGoalDto } from './dto/create-budget-goal.dto';
import { UpdateBudgetGoalDto } from './dto/update-budget-goal.dto';
import { JwtAuthGuard } from '../guard/auth.guard'; // Make sure your JwtAuthGuard is correctly imported
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RequestWithUser } from '../interface/request.user.interface'; // Custom interface for extracting user info

@ApiTags('budget-goals')
@Controller('budget-goals')
export class BudgetGoalController {
  constructor(private readonly budgetGoalService: BudgetGoalService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // Protect route with JWT auth guard
  @ApiBearerAuth() // Indicate the use of Bearer Authentication
  @ApiOperation({ summary: 'Create a new budget goal' })
  @ApiResponse({ status: 201, description: 'The budget goal has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  createGoal(@Body() createBudgetGoalDto: CreateBudgetGoalDto, @Request() req: RequestWithUser) {
    const userId = req.user.id; // Extract userId from the request
    return this.budgetGoalService.createGoal(userId, createBudgetGoalDto.goalAmount);
  }

  @Patch(':goalId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a specific budget goal' })
  @ApiResponse({ status: 200, description: 'The goal has been updated successfully.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  updateGoal(
    @Param('goalId') goalId: number,
    @Body() updateBudgetGoalDto: UpdateBudgetGoalDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
  
    if (updateBudgetGoalDto.goalAmount === undefined) {
      throw new BadRequestException('Goal amount is required.');
    }
  
    return this.budgetGoalService.updateGoal(userId, goalId, updateBudgetGoalDto.goalAmount);
  }
  
  
  @Delete(':goalId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific budget goal' })
  @ApiResponse({ status: 200, description: 'The goal has been marked as deleted.' })
  @ApiResponse({ status: 404, description: 'Goal not found or already deleted.' })
  deleteGoal(
    @Param('goalId') goalId: number,
    @Request() req: RequestWithUser
  ) {
    const userId = req.user.id;
    return this.budgetGoalService.deleteGoal(userId, goalId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user\'s budget goal' })
  @ApiResponse({ status: 200, description: 'The user\'s budget goal data.' })
  @ApiResponse({ status: 404, description: 'Goal not found.' })
  getGoal( @Request() req: RequestWithUser) {
    const userId = req.user.id;
    return this.budgetGoalService.getGoal(userId);
  }
}
