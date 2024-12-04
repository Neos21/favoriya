import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../../shared/entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/** Users Module */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity
    ])
  ],
  controllers: [
    UsersController
  ],
  providers: [
    UsersService
  ],
  exports: [
    UsersService  // AuthModule でも使用する
  ]
})
export class UsersModule { }
