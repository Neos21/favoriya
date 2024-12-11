import { Body, Controller, Delete, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../../shared/helpers/is-valid-jwt-user-id';
import { FavouritesService } from './favourites.service';

import type { Request, Response } from 'express';
import type { Result } from '../../../../common/types/result';

/** Favourites Controller */
@Controller('api/users')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) { }
  
  /** ふぁぼを付ける */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/posts/:postId/favourites')
  public async create(@Param('userId') favouritedPostsUserId: string, @Param('postId') favouritedPostId: string, @Body('user_id') userId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<void>>> {
    if(!isValidJwtUserId(request, response, userId)) return;  // ふぁぼる人の本人確認
    
    const result = await this.favouritesService.create(favouritedPostsUserId, favouritedPostId, userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.CREATED).end();
  }
  
  /** ふぁぼを外す : FavouritesEntity の ID が分からなくても削除可能にする */
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/posts/:postId/favourites')
  public async remove(@Param('userId') favouritedPostsUserId: string, @Param('postId') favouritedPostId: string, @Query('user_id') userId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<void>>> {
    if(!isValidJwtUserId(request, response, userId)) return;  // ふぁぼを外す人の本人確認
    
    const result = await this.favouritesService.remove(favouritedPostsUserId, favouritedPostId, userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.NO_CONTENT).end();
  }
}
