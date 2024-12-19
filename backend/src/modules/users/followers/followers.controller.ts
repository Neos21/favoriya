import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../shared/helpers/is-valid-jwt-user-id';
import { FollowersService } from './followers.service';

import type { Request, Response } from 'express';
import type { Result } from '../../../common/types/result';
import type { UserApi } from '../../../common/types/user';
import type { FollowRelationshipApi } from '../../../common/types/follow-relationship';

/** Followers Controller */
@Controller('api/users')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) { }
  
  /** `:userId` のフォロワー (`:userId` のことをフォローしているユーザ) 一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/followers')
  public async findAll(@Param('userId') userId: string, @Res() response: Response): Promise<Response<Result<Array<UserApi>>>> {
    const result = await this.followersService.findAll(userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const followerUsersApi = result.result.map(followerUser => camelToSnakeCaseObject(followerUser));
    return response.status(HttpStatus.OK).json({ result: followerUsersApi });
  }
  
  /** `:followerUserId` と `followingUserId` のフォロー関係を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/followers/:followingUserId')
  public async getRelationship(@Param('userId') followerUserId: string, @Param('followingUserId') followingUserId: string, @Res() response: Response): Promise<Response<Result<FollowRelationshipApi>>> {
    const result = await this.followersService.getRelationship(followerUserId, followingUserId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const followRelationshipApi: FollowRelationshipApi = camelToSnakeCaseObject(result.result) as unknown as FollowRelationshipApi;
    return response.status(HttpStatus.OK).json({ result: followRelationshipApi });
  }
  
  /** `:userId` = `followerUserId` の人のことをフォローする (ログインしている人は `followingUserId`) */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/followers')
  public async follow(@Param('userId') followerUserId: string, @Body('following_user_id') followingUserId: string, @Req() request: Request, @Res() response: Response): Promise<Response<void>> {
    if(!isValidJwtUserId(request, response, followingUserId)) return;  // フォローする人の本人確認
    
    const result = await this.followersService.follow(followerUserId, followingUserId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.CREATED).end();
  }
  
  /** `:userId` = `followerUserId` の人をアンフォローする (ログインしている人は `followingUserId`) */
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/followers')
  public async unfollow(@Param('userId') followerUserId: string, @Query('following_user_id') followingUserId: string, @Req() request: Request, @Res() response: Response): Promise<Response<void>> {
    if(!isValidJwtUserId(request, response, followingUserId)) return;  // フォローを外す人の本人確認
    
    const result = await this.followersService.unfollow(followerUserId, followingUserId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.NO_CONTENT).end();
  }
}
