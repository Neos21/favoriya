import { Body, Controller, HttpStatus, Logger, Post, Res } from '@nestjs/common';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { UsersService } from './users.service';

import type { Response } from 'express';
import type { Result } from '../../common/types/result';
import type { User, UserApi } from '../../common/types/user';

/** Users Controller */
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  
  /** ユーザ登録する */
  @Post('')
  public async create(@Body() userApi: UserApi, @Res() response: Response): Promise<Response<Result<null>>> {
    try {
      const user: User = snakeToCamelCaseObject(userApi);
      const result = await this.usersService.create(user);  // Throws
      if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      
      return response.status(HttpStatus.CREATED).end();
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.error });
    }
  }
}
