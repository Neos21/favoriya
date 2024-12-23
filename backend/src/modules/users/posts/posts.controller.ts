import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Query, Req, Res, UseGuards } from '@nestjs/common';

import { topicsConstants } from '../../../common/constants/topics-constants';
import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../shared/helpers/is-valid-jwt-user-id';
import { PostDecorationService } from './post-decoration.service';
import { PostValidationService } from './post-validation.service';
import { PostsService } from './posts.service';

import type { Request, Response } from 'express';
import type { Result } from '../../../common/types/result';
import type { Post as TypePost, PostApi } from '../../../common/types/post';

/** Posts Controller */
@Controller('api/users')
export class PostsController {
  constructor(
    private readonly postValidationService: PostValidationService,
    private readonly postDecorationService: PostDecorationService,
    private readonly postsService: PostsService
  ) { }
  
  /** 投稿する */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/posts')  // キャメルケースでないと動作しない
  public async create(@Param('userId') userId: string, @Body() postApi: PostApi, @Req() request: Request, @Res() response: Response): Promise<Response<Result<null>>> {
    if(!isValidJwtUserId(request, response, userId)) return;
    
    const post: TypePost = snakeToCamelCaseObject(postApi) as TypePost;
    
    // トピックごとに入力チェックする
    const validationResult = this.postValidationService.validateText(post.text, post.topicId);
    if(validationResult.error != null) return response.status(validationResult.code ?? HttpStatus.BAD_REQUEST).json(validationResult);
    
    // 川柳モードの時にスタイリングできそうならする
    if(post.topicId === topicsConstants.senryu.id) post.text = this.postDecorationService.senryuStyle(post.text);
    // ランダム装飾モードの場合に行ごとにタグを入れたり入れなかったりする
    if(post.topicId === topicsConstants.randomDecorations.id) post.text = this.postDecorationService.decorateRandomly(post.text);
    
    const result = await this.postsService.create(post);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.CREATED).end();
  }
  
  /** 投稿一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/posts')
  public async findById(@Param('userId') userId: string, @Query('offset', ParseIntPipe) offset: number = 0, @Query('limit', ParseIntPipe) limit: number = 50, @Res() response: Response): Promise<Response<Result<Array<PostApi>>>> {
    const result = await this.postsService.findById(userId, offset, limit);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const posts: Array<PostApi> = result.result.map(postEntity => camelToSnakeCaseObject(postEntity)) as unknown as Array<PostApi>;
    return response.status(HttpStatus.OK).json({ result: posts });
  }
  
  /** 投稿1件を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/posts/:postId')
  public async findOneById(@Param('userId') userId: string, @Param('postId') postId: string, @Res() response: Response): Promise<Response<Result<Array<PostApi>>>> {
    const result = await this.postsService.findOneById(userId, postId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const post: PostApi = camelToSnakeCaseObject(result.result) as unknown as PostApi;
    return response.status(HttpStatus.OK).json({ result: post });
  }
  
  /** 投稿1件を削除する */
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/posts/:postId')
  public async removeOneById(@Param('userId') userId: string, @Param('postId') postId: string, @Req() request: Request, @Res() response: Response): Promise<Response<void>> {
    const jwtPayload = (request as unknown as { user: { role: string } }).user;
    if(jwtPayload.role !== 'Admin') {  // 管理者は誰の投稿でも消せるようにする・それ以外のロールは本人のみ削除可能
      if(!isValidJwtUserId(request, response, userId)) return;
    }
    
    const result = await this.postsService.removeOneById(userId, postId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.NO_CONTENT).end();
  }
}
