import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
import { PollsService } from './polls.service';

import type { Response } from 'express';
import type { Result } from '../../../../common/types/result';
import type { PollApi } from '../../../../common/types/poll';

/** Polls Controller */
@Controller('api/users')
export class PollsController {
  constructor(private readonly pollsService: PollsService) { }
  
  /** アンケートを取得する (選択肢・投票内容) */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/posts/:postId/polls')
  public async findOne(@Param('userId') postsUserId: string, @Param('postId') postId: string, @Res() response: Response): Promise<Response<Result<PollApi>>> {
    const result = await this.pollsService.findOne(postsUserId, postId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const pollApi = camelToSnakeCaseObject(result.result);
    return response.status(HttpStatus.OK).json({ result: pollApi });
  }
  
  /** アンケートに投票する */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/posts/:postId/polls/:pollId/votes')
  public async vote(@Param('userId') postsUserId: string, @Param('pollId', ParseIntPipe) pollId: number, @Body('poll_option_id', ParseIntPipe) pollOptionId: number, @Body('user_id') userId: string, @Res() response: Response): Promise<Response<void>> {
    // アンケート投稿者と回答者が同じ場合は NG とする
    if(postsUserId === userId) return response.status(HttpStatus.BAD_REQUEST).json({ result: 'アンケート作成者は回答できません' });
    
    const result = await this.pollsService.vote(pollId, pollOptionId, userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.CREATED).end();
  }
}
