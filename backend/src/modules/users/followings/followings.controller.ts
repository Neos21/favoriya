import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../shared/helpers/is-valid-jwt-user-id';
import { FollowingsService } from './followings.service';

import type { Request, Response } from 'express';
import type { Result } from '../../../common/types/result';

/** Followings Controller */
@Controller('api/users')
export class FollowingsController {
  constructor(private readonly followingsService: FollowingsService) { }
  
  /** `:userId` がフォローしているユーザ一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/followings')
  public async findAll(@Param('userId') userId: string, @Res() response: Response): Promise<Response<Result<any>>> {
    const result = await this.followingsService.findAll(userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    // TODO : 型変換か？
    return response.status(HttpStatus.OK).json(result);
  }
  
  /** `:userId` = `followerUserId` の人のことをフォローする (ログインしている人は `followingUserId`) */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/followings')
  public async follow(@Param('userId') followerUserId: string, @Body('following_user_id') followingUserId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<void>>> {
    if(!isValidJwtUserId(request, response, followingUserId)) return;  // フォローする人の本人確認
    
    const result = await this.followingsService.follow(followerUserId, followingUserId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.CREATED).end();
  }
  
  /** `:userId` = `followerUserId` の人をアンフォローする (ログインしている人は `followingUserId`) */
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/followings')
  public async unfollow(@Param('userId') followerUserId: string, @Query('following_user_id') followingUserId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<void>>> {
    if(!isValidJwtUserId(request, response, followingUserId)) return;  // フォローを外す人の本人確認
    
    const result = await this.followingsService.unfollow(followerUserId, followingUserId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.NO_CONTENT).end();
  }
}
