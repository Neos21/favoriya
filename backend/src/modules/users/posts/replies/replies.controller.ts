import { Body, Controller, Get, HttpStatus, Logger, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { camelToSnakeCaseObject, snakeToCamelCaseObject } from '../../../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../../shared/helpers/is-valid-jwt-user-id';
import { RepliesService } from './replies.service';

import type { Request, Response } from 'express';
import type { Post as TypePost, PostApi } from '../../../../common/types/post';

/** Replies Controller */
@Controller('api/users')
export class RepliesController {
  private readonly logger: Logger = new Logger(RepliesController.name);
  
  constructor(private readonly repliesService: RepliesService) { }
  
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
  @UseInterceptors(FileInterceptor('file'))
  public async create(@Param('userId') inReplyToUserId: string, @Param('postId') inReplyToPostId: string, @Body('post_json') postJson: string, @UploadedFile() file: Express.Multer.File, @Req() request: Request, @Res() response: Response): Promise<Response<void>> {
    try {
      const postApi: PostApi = JSON.parse(postJson);  // Throws
      const post: TypePost = snakeToCamelCaseObject(postApi) as TypePost;
      
      if(!isValidJwtUserId(request, response, postApi.user_id)) return;  // リプライする人の本人確認
      
      const result = await this.repliesService.create(inReplyToUserId, inReplyToPostId, post, file);
      if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
      
      return response.status(HttpStatus.CREATED).end();
    }
    catch(error) {
      this.logger.error('リプライ処理に失敗', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'リプライ処理に失敗' });
    }
  }
}
