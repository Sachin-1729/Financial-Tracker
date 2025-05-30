import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  imports: [TypeOrmModule.forFeature([User]) , JwtModule ],
  providers: [UserService , UserController],
  exports: [TypeOrmModule , UserService],
})
export class UserModule {}
  