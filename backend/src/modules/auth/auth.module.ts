import { Module } from '@nestjs/common';

import { SharedModule } from '../../shared/shared.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/** Auth Module */
@Module({
  imports: [
    SharedModule
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService
  ]
})
export class AuthModule { }
