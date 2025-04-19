import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt'; // <-- ADD THIS
import { jwtConstants } from '../constant'; // <-- Your secret, or you can define inline
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';


@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: jwtConstants.secret, // or use process.env.JWT_SECRET
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([User]) 
  ],
  controllers: [AuthController],
  providers: [AuthService ],
  exports: [AuthService , JwtModule ],
})
export class AuthModule {}
