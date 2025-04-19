import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createTransactionDto: CreateTransactionDto, userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      user,
    });

    return this.transactionRepository.save(transaction);
  }

  async findAll(userId: number) {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string, userId: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.user.id !== userId)
      throw new ForbiddenException('Access denied');

    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto, userId: number) {
    const transaction = await this.findOne(id, userId); // includes check

    Object.assign(transaction, dto);

    return this.transactionRepository.save(transaction);
  }

  async remove(id: string, userId: number) {
    const transaction = await this.findOne(id, userId); // includes check

    return this.transactionRepository.remove(transaction);
  }
}
