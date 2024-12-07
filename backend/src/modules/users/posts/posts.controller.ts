import { Body, Controller, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../shared/helpers/is-valid-jwt-user-id';
import { PostsService } from './posts.service';

import type { Request, Response } from 'express';
import type { Result } from '../../../common/types/result';
import type { Post as TypePost, PostApi } from '../../../common/types/post';

/** Posts Controller */
@Controller('api/users')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }
  
  /** 投稿する */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/posts')  // キャメルケースでないと動作しない
  public async create(@Param('userId') userId: string, @Body() postApi: PostApi, @Req() request: Request, @Res() response: Response): Promise<Response<Result<null>>> {
    if(!isValidJwtUserId(request, response, userId)) return;
    
    const post: TypePost = snakeToCamelCaseObject(postApi);
    const result = await this.postsService.create(post);
    if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.CREATED).end();
  }
}
