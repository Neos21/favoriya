import { Body, Controller, Delete, HttpStatus, ParseIntPipe, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtAdminRole } from '../../../shared/helpers/is-valid-jwt-admin-role';
import { AdminEmojisService } from './admin-emojis.service';

import type { Request, Response } from 'express';
import type { Result } from '../../../common/types/result';

/** Admin Emojis Controller */
@Controller('api/admin/emojis')
export class AdminEmojisController {
  constructor(private readonly adminEmojisService: AdminEmojisService) { }
  
  /** 絵文字リアクション画像をアップロードする */
  @UseGuards(JwtAuthGuard)
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  public async create(@Body('name') name: string, @UploadedFile() file: Express.Multer.File, @Req() request: Request, @Res() response: Response): Promise<Response<Result<string>>> {
    if(!isValidJwtAdminRole(request, response)) return;
    
    const result = await this.adminEmojisService.create(name, file);
    if(result.error != null) return response.status(result.code ?? HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    
    return response.status(HttpStatus.OK).json(result);
  }
  
  /** 絵文字リアクション画像を削除する */
  @UseGuards(JwtAuthGuard)
  @Delete('')
  public async remove(@Query('id', ParseIntPipe) id: number, @Req() request: Request, @Res() response: Response): Promise<Response<void>> {
    if(!isValidJwtAdminRole(request, response)) return;
    
    const result = await this.adminEmojisService.remove(id);
    if(result.error != null) return response.status(result.code ?? HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    
    return response.status(HttpStatus.NO_CONTENT).end();
  }
}
