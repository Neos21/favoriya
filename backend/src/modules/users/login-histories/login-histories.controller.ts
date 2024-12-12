import { Controller, Get, HttpStatus, Param, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../shared/helpers/is-valid-jwt-user-id';
import { LoginHistoriesService } from './login-histories.service';

import type { Request, Response } from 'express';
import type { LoginHistoryApi } from '../../../common/types/login-history';
import type { Result } from '../../../common/types/result';

/** Login Histories Controller */
@Controller('api/users')
export class LoginHistoriesController {
  constructor(private readonly loginHistoriesService: LoginHistoriesService) { }
  
  /** ユーザのログイン履歴一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/login-histories')
  public async findAll(@Param('userId') userId, @Req() request: Request, @Res() response: Response): Promise<Response<Result<Array<LoginHistoryApi>>>> {
    if(!isValidJwtUserId(request, response, userId)) return;
    
    const result = await this.loginHistoriesService.findAll(userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const loginHistoriesApi = result.result.map(loginHistoryEntity => camelToSnakeCaseObject(loginHistoryEntity));
    return response.status(HttpStatus.OK).json({ result: loginHistoriesApi });
  }
}
