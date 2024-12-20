import { Controller, Get, HttpStatus, ParseIntPipe, Query, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../common/helpers/convert-case';
import { PostEntity } from '../../shared/entities/post.entity';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { SearchService } from './search.service';

import type { Response } from 'express';
import type { Result } from '../../common/types/result';
import type { PostApi } from '../../common/types/post';

/** Search Controller */
@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) { }
  
  /** 検索する */
  @UseGuards(JwtAuthGuard)
  @Get('')
  public async search(@Query('query') query: string, @Query('offset', ParseIntPipe) offset: number = 0, @Query('limit', ParseIntPipe) limit: number = 50, @Res() response: Response): Promise<Response<Result<Array<PostApi>>>> {
    const result: Result<Array<PostEntity>> = await this.searchService.search(query, offset, limit);
    if(result.error != null) return response.status(HttpStatus.BAD_REQUEST).json(result);
    
    const postsApi: Array<PostApi> = result.result.map(postEntity => camelToSnakeCaseObject(postEntity)) as unknown as Array<PostApi>;
    return response.status(HttpStatus.OK).json({ result: postsApi });
  }
}
