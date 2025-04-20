import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { Request } from 'express';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/guard/auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';


@ApiBearerAuth() 
@Controller('transaction')
 @UseGuards(JwtAuthGuard) // Uncomment if guarding routes
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() request: Request) {
    const user = request.user as any; // If using passport-jwt, user is set here
    return this.transactionService.create(createTransactionDto, user.id);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  findAll(
    @Req() request: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    const user = request.user as any;
    const take = Math.min(limit, 100); // cap the limit to 100
    const skip = (page - 1) * take;
  
    return this.transactionService.findAll(user.id, take, skip);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    const user = request.user as any;
    return this.transactionService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() request: Request,
  ) {
    const user = request.user as any;
    return this.transactionService.update(id, updateTransactionDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const user = request.user as any;
    return this.transactionService.remove(id, user.id);
  }
}
