import { Controller, Get, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FollowingsService } from './followings.service';

import type { Response } from 'express';
import type { Result } from '../../../common/types/result';
import type { UserApi } from '../../../common/types/user';

/** Followings Controller */
@Controller('api/users')
export class FollowingsController {
  constructor(private readonly followingsService: FollowingsService) { }
  
  /** `:userId` がフォローしているユーザ一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/followings')
  public async findAll(@Param('userId') userId: string, @Res() response: Response): Promise<Response<Result<Array<UserApi>>>> {
    const result = await this.followingsService.findAll(userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const followingUsersApi = result.result.map(followingUser => camelToSnakeCaseObject(followingUser));
    return response.status(HttpStatus.OK).json({ result: followingUsersApi });
  }
}
