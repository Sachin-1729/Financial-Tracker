import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; 

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
    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,  // Store hashed password
    });
    return this.userRepository.save(user);
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
