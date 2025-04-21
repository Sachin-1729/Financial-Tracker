import { Injectable } from '@nestjs/common';
import { CreateFinanceChatDto } from './dto/create-finance-chat.dto';
import { UpdateFinanceChatDto } from './dto/update-finance-chat.dto';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';





@Injectable()
export class FinanceChatService {


private  openai: OpenAI

constructor(
  @InjectRepository(Transaction)
  private readonly transactionRepo: Repository<Transaction>,
  @InjectRepository(User)
  private readonly userRepo: Repository<User>,
) {
 
  this.openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

async getAIResponse(userId: number , question: string ): Promise<string | null> {
  const currentDate = new Date();

 
    
  // Subtract 30 days from current date
  const last30Days = new Date(currentDate);
  last30Days.setDate(currentDate.getDate() - 1);

  const transactions = await this.transactionRepo.find({
    where: {
      user: { id: userId },
      date: MoreThan(last30Days), // MoreThan ensures we get transactions from the last 30 days
    },
  });

  if (transactions.length === 0) {
    return 'No transactions found for the last 30 days.';
  }
  const totalIncome = transactions
  .filter(t => t.type === 'income')
  .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
  .filter(t => t.type === 'expense')
  .reduce((acc, t) => acc + t.amount, 0);

    // Update the summary to use descriptions instead of categories
    const summary = `
    User ID: ${userId}
    Total Income: ₹${totalIncome}
    Total Expense: ₹${totalExpense}
    Transactions Descriptions:
    ${transactions.map(t => `- ${t.description}: ₹${t.amount}`).join('\n')}

    User's Question: "${question}"
  `;

  const response = await this.openai.chat.completions.create({
    model: 'gpt-3.5-turbo', // Or 'gpt-4' if you have access to GPT-4
    messages: [
      {
        role: 'system',
        content: 'You are a helpful financial assistant. Respond like a finance-savvy buddy. Use the data provided only.',
      },
      {
        role: 'user',
        content: summary,
      },
    ],
  });
  console.log(response.choices[0].message.content);
  return response.choices[0].message.content;
}



}
