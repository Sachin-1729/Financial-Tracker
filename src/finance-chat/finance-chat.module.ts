import { Module } from '@nestjs/common';
import { FinanceChatService } from './finance-chat.service';
import { FinanceChatController } from './finance-chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { Transaction } from 'src/transaction/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction]), JwtModule],
  controllers: [FinanceChatController],
  providers: [FinanceChatService],
})
export class FinanceChatModule {}
