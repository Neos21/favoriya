import { Body, Controller, Delete, HttpStatus, Param, ParseIntPipe, Post, Query, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../../../common/helpers/convert-case';
import { EmojiReactionApi } from '../../../../common/types/emoji-reaction';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../../shared/helpers/is-valid-jwt-user-id';
import { PostEmojisService } from './post-emojis.service';

import type { Request, Response } from 'express';

/** Post Emojis Controller */
@Controller('api/users')
export class PostEmojisController {
  constructor(private readonly postEmojisService: PostEmojisService) { }
  
  /** 絵文字リアクションを付ける */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/posts/:postId/emojis')
  public async create(@Param('userId') reactedPostsUserId: string, @Param('postId') reactedPostId: string, @Body('user_id') userId: string, @Body('emoji_id', ParseIntPipe) emojiId: number, @Req() request: Request, @Res() response: Response): Promise<Response<EmojiReactionApi>> {
    if(!isValidJwtUserId(request, response, userId)) return;  // 本人確認
    
    const result = await this.postEmojisService.create(reactedPostsUserId, reactedPostId, userId, emojiId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const emojiReactionApi = camelToSnakeCaseObject(result.result);
    return response.status(HttpStatus.OK).json({ result: emojiReactionApi });
  }
  
  /** 絵文字リアクションを外す */
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/posts/:postId/emojis/:id')
  public async remove(@Param('userId') reactedPostsUserId: string, @Param('postId') reactedPostId: string, @Param('id', ParseIntPipe) id: number, @Query('user_id') userId: string, @Req() request: Request, @Res() response: Response): Promise<Response<void>> {
    if(!isValidJwtUserId(request, response, userId)) return;  // 本人確認
    
    const result = await this.postEmojisService.remove(reactedPostsUserId, reactedPostId, userId, id);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.NO_CONTENT).end();
  }
}
