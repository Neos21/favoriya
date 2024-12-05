
import { Body, Controller, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';

import { snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { PostsService } from './posts.service';

import type { Response } from 'express';
import type { Result } from '../../../common/types/result';
import type { Post as TypePost, PostApi } from '../../../common/types/post';

/** Posts Controller */
@Controller('api/users')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }
  
  @UseGuards(JwtAuthGuard)
  @Post(':userId/posts')  // キャメルケースでないと動作しない
  public async create(@Param('userId') _userId: string, @Body() postApi: PostApi, @Res() response: Response): Promise<Response<Result<null>>> {
    try {
      const post: TypePost = snakeToCamelCaseObject(postApi);
      const result = await this.postsService.create(post);  // Throws
      if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json({ error: result.error });
      
      return response.status(HttpStatus.CREATED).end();
    }
    catch(_error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: '投稿処理に失敗しました' });
    }
  }
}
