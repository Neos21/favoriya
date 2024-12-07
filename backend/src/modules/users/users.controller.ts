import { Body, Controller, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UsersService } from './users.service';

import type { Request, Response } from 'express';
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
      if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json(result);
      
      return response.status(HttpStatus.CREATED).end();
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.error });
    }
  }
  
  /** ユーザ情報を一部更新する */
  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  public async patch(@Param('userId') id: string, @Body() userApi: UserApi, @Req() request: Request, @Res() response: Response): Promise<Response<Result<UserApi>>> {
    try {
      const jwtPayload = (request as unknown as { user: { sub: string } }).user;
      if(jwtPayload.sub !== id) return response.status(HttpStatus.UNAUTHORIZED).json({ error: 'このリソースにアクセスすることは許可されていません' });
      
      const user: User = snakeToCamelCaseObject(userApi);
      const result = await this.usersService.patch(id, user);
      if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json(result);
      
      const updatedUser: UserApi = camelToSnakeCaseObject(result.result);  // Throws
      return response.status(HttpStatus.OK).json({ result: updatedUser });
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.error });
    }
  }
}
