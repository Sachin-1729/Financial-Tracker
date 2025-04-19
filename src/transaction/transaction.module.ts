import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { User } from '../user/entities/user.entity'; // Only if needed in service
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User]) , JwtModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
