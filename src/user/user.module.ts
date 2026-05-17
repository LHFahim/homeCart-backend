import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypegooseModule } from 'nestjs-typegoose';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypegooseModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService, JwtService],
  exports: [UserService],
})
export class UserModule {}
