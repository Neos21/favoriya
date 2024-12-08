import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../common/helpers/convert-case';
import { PostEntity } from '../../shared/entities/post.entity';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { TimelineService } from './timeline.service';

import type { Response } from 'express';
import type { Result } from '../../common/types/result';
import type { PostApi } from '../../common/types/post';

/** Timeline Controller */
@Controller('api/timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) { }
  
  /** グローバルタイムライン */
  @UseGuards(JwtAuthGuard)
  @Get('global')
  public async globalTimeline(@Res() response: Response): Promise<Response<Result<Array<PostApi>>>> {
    const result: Result<Array<PostEntity>> = await this.timelineService.getGlobalTimeline();
    if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json(result);
    
    const postsApi: Array<PostApi> = result.result.map(postEntity => camelToSnakeCaseObject(postEntity));
    return response.status(HttpStatus.OK).json({ result: postsApi });
  }
}
