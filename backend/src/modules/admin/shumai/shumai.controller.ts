import { Body, Controller, Get, HttpStatus, ParseIntPipe, Post, Query, Req, Res, UseGuards } from '@nestjs/common';

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
  
  /** テキストを元にマルコフ連鎖で文章を生成する */
  @UseGuards(JwtAuthGuard)
  @Post('generate')
  public generate(@Body('text') text: string, @Req() request: Request, @Res() response: Response): Response<Result<string>> {
    if(!isValidJwtAdminRole(request, response)) return;
    
    const result = this.shumaiService.generate(text);
    if(result.error != null) return response.status(result.code ?? HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    
    return response.status(HttpStatus.OK).json(result);
  }
  
  /** テキストを投稿する */
  @UseGuards(JwtAuthGuard)
  @Post('post')
  public async post(@Body('text') text: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<boolean>>> {
    if(!isValidJwtAdminRole(request, response)) return;
    
    const result = await this.shumaiService.post(text);
    if(result.error != null) return response.status(result.code ?? HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    
    return response.status(HttpStatus.OK).json(result);
  }
}
