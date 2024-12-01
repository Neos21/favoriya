import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';

/** Auth Module */
@Module({
  controllers: [AuthController]
})
export class AuthModule { }
