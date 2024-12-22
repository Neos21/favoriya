import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';

import { topicsConstants } from '../../../../common/constants/topics-constants';
import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../../shared/helpers/is-valid-jwt-user-id';
import { PostDecorationService } from '../post-decoration.service';
import { PostValidationService } from '../post-validation.service';
import { RepliesService } from './replies.service';

import type { Request, Response } from 'express';
import type { Post as TypePost, PostApi } from '../../../../common/types/post';

/** Replies Controller */
@Controller('api/users')
export class RepliesController {
  constructor(
    private readonly repliesService: RepliesService,
    private readonly postValidationService: PostValidationService,
    private readonly postDecorationService: PostDecorationService,
  ) { }
  
  /** リプライ一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/posts/:postId/replies')
  public async findAllAfterReplies(@Param('userId') inReplyToUserId: string, @Param('postId') inReplyToPostId: string, @Res() response: Response): Promise<Response<Array<PostApi>>> {
    const result = await this.repliesService.findAllAfterReplies(inReplyToUserId, inReplyToPostId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const postsApi = result.result.map(postEntity => camelToSnakeCaseObject(postEntity));
    return response.status(HttpStatus.OK).json({ result: postsApi });
  }
  
  /** リプライする */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/posts/:postId/replies')
  public async create(@Param('userId') inReplyToUserId: string, @Param('postId') inReplyToPostId: string, @Body() postApi: PostApi, @Req() request: Request, @Res() response: Response): Promise<Response<void>> {
    if(!isValidJwtUserId(request, response, postApi.user_id)) return;  // リプライする人の本人確認
    
    const post: TypePost = snakeToCamelCaseObject(postApi) as TypePost;
    
    // トピックごとに入力チェックする
    const validationResult = this.postValidationService.validateText(post.text, post.topicId);
    if(validationResult.error != null) return response.status(validationResult.code ?? HttpStatus.BAD_REQUEST).json(validationResult);
    
    // 川柳モードの時にスタイリングできそうならする
    if(post.topicId === topicsConstants.senryu.id) post.text = this.postDecorationService.senryuStyle(post.text);
    // ランダム装飾モードの場合に行ごとにタグを入れたり入れなかったりする
    if(post.topicId === topicsConstants.randomDecorations.id) post.text = this.postDecorationService.decorateRandomly(post.text);
    
    const result = await this.repliesService.create(inReplyToUserId, inReplyToPostId, post);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.CREATED).end();
  }
}
