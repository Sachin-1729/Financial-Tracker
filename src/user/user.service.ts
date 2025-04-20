import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; 
import { ConflictException } from '@nestjs/common'; // To throw a specific exception for conflict


@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

    // Function to hash password
    private async hashPassword(password: string): Promise<string> {
      const salt = await bcrypt.genSalt(10);  // Generate salt
      return bcrypt.hash(password, salt);  // Hash password with salt
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
      return bcrypt.compare(password, hashedPassword);
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
      try {
        // Check if the user already exists by email
        const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    
        if (existingUser) {
          // If the user exists, throw a ConflictException
          throw new ConflictException('Email already exists');
        }
    
        // Hash the password before saving
        const hashedPassword = await this.hashPassword(createUserDto.password);
    
        // Create the user object with the hashed password
        const user = this.userRepository.create({
          ...createUserDto,
          password: hashedPassword,  // Store hashed password
        });
    
        // Save the new user to the database
        return await this.userRepository.save(user);
      } catch (error) {
        // Log the error details for debugging purposes
        console.error('Error creating user:', error);
    
        // If the error is due to a conflict (e.g., duplicate email), return the conflict error
        if (error instanceof ConflictException) {
          console.log('Duplicate email detected');
          throw error;  // Rethrow the conflict exception to return a 409 Conflict
        }
    
        // For other errors, throw an internal server error with a message
        console.log('Internal server error occurred');
        throw new InternalServerErrorException('An unexpected error occurred while creating the user');
      }
    }
 
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User | null> {
    if(!id){
      return null;
    }
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    if(!id){
      return null;
    }
    // If the update includes a password, hash it first
    if (updateUserDto.password) {
          updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
     // Update user with the new data
     await this.userRepository.update(id, updateUserDto);

     // Return the updated user
     return this.findOne(id);
  }
  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
