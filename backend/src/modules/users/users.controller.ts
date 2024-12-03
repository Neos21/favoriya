import { camelToSnakeCaseObject, snakeToCamelCaseObject } from 'src/shared/helpers/convert-case';

import { Body, Controller, HttpStatus, Logger, Post, Res } from '@nestjs/common';

import { UsersService } from './users.service';

import type { User, UserApi } from '../../shared/types/user';
import type { Response } from 'express';

/** Users Controller */
@Controller('api/users')
export class UsersController {
  private readonly logger: Logger = new Logger(UsersController.name);
  
  constructor(private readonly usersService: UsersService) { }
  
  /** ユーザ登録する */
  @Post('')
  public async create(@Body() userApi: UserApi, @Res() response: Response): Promise<Response<{ error?: string }>> {
    try {
      const user: User = snakeToCamelCaseObject(userApi);
      const result = await this.usersService.create(user);  // Throws
      if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      
      return response.status(HttpStatus.CREATED).end();
    }
    catch(error) {
      this.logger.error('ユーザ登録処理に失敗しました', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'ユーザ登録処理に失敗しました' });
    }
  }
}
