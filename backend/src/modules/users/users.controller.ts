import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../shared/helpers/is-valid-jwt-user-id';
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
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.error ?? error.toString() });
    }
  }
  
  /** ユーザ情報一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get('')
  public async findAll(@Res() response: Response): Promise<Response<Result<Array<UserApi>>>> {
    const result = await this.usersService.findAll();
    const usersApi = result.result.map(userApi => snakeToCamelCaseObject(userApi));
    return response.status(HttpStatus.OK).json({ result: usersApi });
  }
  
  /** ユーザ ID を条件にユーザ情報を取得する (パスワードハッシュは取得しない) */
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  public async findOneById(@Param('userId') id: string, @Res() response: Response): Promise<Response<Result<UserApi>>> {
    const result = await this.usersService.findOneById(id);
    if(result.error != null) {
      if(result.error === this.usersService.userNotFoundErrorMessage) return response.status(HttpStatus.NOT_FOUND).json(result);
      return response.status(HttpStatus.BAD_REQUEST).json(result);
    }
    
    const userApi = snakeToCamelCaseObject(result.result);
    return response.status(HttpStatus.OK).json({ result: userApi });
  }
  
  /** ユーザ情報を一部更新する */
  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  public async patch(@Param('userId') id: string, @Body() userApi: UserApi, @Req() request: Request, @Res() response: Response): Promise<Response<Result<UserApi>>> {
    try {
      if(!isValidJwtUserId(request, response, id)) return;
      
      const user: User = snakeToCamelCaseObject(userApi);
      const result = await this.usersService.patch(id, user);  // Throws
      if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json(result);
      
      const updatedUser: UserApi = camelToSnakeCaseObject(result.result);
      return response.status(HttpStatus.OK).json({ result: updatedUser });
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.error ?? error.toString() });
    }
  }
  
  /** パスワードを変更する */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/change-password')
  public async changePassword(@Param('userId') id: string, @Body('current_password') currentPassword: string, @Body('new_password') newPassword: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<boolean>>> {
    try {
      if(!isValidJwtUserId(request, response, id)) return;
      
      const result = await this.usersService.changePassword(id, currentPassword, newPassword);  // Throws
      if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json(result);
      
      return response.status(HttpStatus.OK).json(result);
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.error ?? error.toString() });
    }
  }
}
