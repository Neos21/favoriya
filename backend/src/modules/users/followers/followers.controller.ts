import { Controller, Get, HttpStatus, Param, Res, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { FollowersService } from './followers.service';

import type { Response } from 'express';
import type { Result } from '../../../common/types/result';

/** Followers Controller */
@Controller('api/users')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) { }
  
  /** `:userId` のフォロワー (`:userId` のことをフォローしているユーザ) 一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/followers')
  public async findAll(@Param('userId') userId: string, @Res() response: Response): Promise<Response<Result<any>>> {
    const result = await this.followersService.findAll(userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    // TODO : 型変換か？
    return response.status(HttpStatus.OK).json(result);
  }
  
  /** `:userId` のフォロワー (`:userId` のことをフォローしているユーザ) 一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/followers/:followingUserId')
  public async findOne(@Param('userId') followerUserId: string, @Param('followingUserId') followingUserId: string, @Res() response: Response): Promise<Response<Result<any>>> {
    const result = await this.followersService.findOne(followerUserId, followingUserId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    // TODO : 型変換か？
    return response.status(HttpStatus.OK).json(result);
  }
}
