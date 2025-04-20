import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { User } from '../user/entities/user.entity';
import { eventEmitter } from 'src/common/event-emitter';

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
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - 7); 
    const transactionDate = new Date(createTransactionDto.date);
    if (transactionDate < sevenDaysAgo || transactionDate > currentDate) {
      throw new BadRequestException('Transaction date must be within the last 7 days.');
  }
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      user,
    });
    const savedTransaction = await this.transactionRepository.save(transaction);
  // Emit the event after saving the transaction
    eventEmitter.emit('transaction.created', transaction);


     // Return the saved transaction
  return savedTransaction;
  }

  async findAll(userId: number, take: number, skip: number) {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
      take,
      skip,

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
   const savedTransaction = await this.transactionRepository.save(transaction);
   // Emit the event after saving the transaction
   eventEmitter.emit('transaction.updated', transaction);

    return savedTransaction;
   
  }

  async remove(id: string, userId: number) {
    const transaction = await this.findOne(id, userId); // includes check
     
    const deletedTransaction = await this.transactionRepository.remove(transaction);

    // Emit the event after deleting the transaction
    eventEmitter.emit('transaction.deleted', transaction);
    return deletedTransaction;
  }   
}
