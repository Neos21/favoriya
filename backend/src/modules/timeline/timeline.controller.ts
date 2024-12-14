import { Controller, Get, HttpStatus, ParseIntPipe, Query, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../common/helpers/convert-case';
import { PostEntity } from '../../shared/entities/post.entity';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../shared/helpers/is-valid-jwt-user-id';
import { TimelineService } from './timeline.service';

import type { Request, Response } from 'express';
import type { Result } from '../../common/types/result';
import type { PostApi } from '../../common/types/post';

/** Timeline Controller */
@Controller('api/timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) { }
  
  /** グローバルタイムライン */
  @UseGuards(JwtAuthGuard)
  @Get('global')
  public async globalTimeline(@Query('offset', ParseIntPipe) offset: number = 0, @Query('limit', ParseIntPipe) limit: number = 100, @Res() response: Response): Promise<Response<Result<Array<PostApi>>>> {
    const result: Result<Array<PostEntity>> = await this.timelineService.getGlobalTimeline(offset, limit);
    if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json(result);
    
    const postsApi: Array<PostApi> = result.result.map(postEntity => camelToSnakeCaseObject(postEntity));
    return response.status(HttpStatus.OK).json({ result: postsApi });
  }
  
  /** ホームタイムライン */
  @UseGuards(JwtAuthGuard)
  @Get('home')
  public async homeTimeline(@Query('user_id') userId: string, @Query('offset', ParseIntPipe) offset: number = 0, @Query('limit', ParseIntPipe) limit: number = 100, @Req() request: Request, @Res() response: Response): Promise<Response<Result<Array<PostApi>>>> {
    if(!isValidJwtUserId(request, response, userId)) return;  // ログインユーザ本人のみ
    
    const result: Result<Array<PostEntity>> = await this.timelineService.getHomeTimeline(userId, offset, limit);
    if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json(result);
    
    const postsApi: Array<PostApi> = result.result.map(postEntity => camelToSnakeCaseObject(postEntity));
    return response.status(HttpStatus.OK).json({ result: postsApi });
  }
}
