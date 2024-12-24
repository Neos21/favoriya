import { Controller, Get, HttpStatus, ParseIntPipe, Query, Req, Res, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtAdminRole } from '../../../shared/helpers/is-valid-jwt-admin-role';
import { ShumaiService } from './shumai.service';

import type { Request, Response } from 'express';
import type { Result } from '../../../common/types/result';

/** Shumai Controller */
@Controller('api/admin/shumai')
export class ShumaiController {
  constructor(private readonly shumaiService: ShumaiService) { }
  
  /** ランダムに投稿文を取得する */
  @UseGuards(JwtAuthGuard)
  @Get('get-random-posts')
  public async getRandomPosts(@Query('number_of_posts', ParseIntPipe) numberOfPosts: number = 5, @Req() request: Request, @Res() response: Response): Promise<Response<Result<Array<string>>>> {
    if(!isValidJwtAdminRole(request, response)) return;
    
    const result = await this.shumaiService.getRandomPosts(numberOfPosts);
    if(result.error != null) return response.status(result.code ?? HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    
    return response.status(HttpStatus.OK).json(result);
  }
}
