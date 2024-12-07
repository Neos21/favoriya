import { Controller, Get, HttpStatus, Res, UseGuards } from '@nestjs/common';

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
    try {
      const result: Result<Array<PostApi>> = await this.timelineService.getGlobalTimeline();
      return response.status(HttpStatus.OK).json(result);
    }
    catch(error) {
      return response.status(HttpStatus.BAD_REQUEST).json({ error: error.error ?? error.toString() });
    }
  }
}
