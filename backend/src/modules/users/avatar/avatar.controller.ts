import { Controller, Delete, HttpStatus, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../shared/helpers/is-valid-jwt-user-id';
import { AvatarService } from './avatar.service';

import type { Request, Response } from 'express';
import type { Result } from '../../../common/types/result';

/** Avatar Controller */
@Controller('api/users')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) { }
  
  /** アバター画像をアップロードする */
  @UseGuards(JwtAuthGuard)
  @Post(':userId/avatar')
  @UseInterceptors(FileInterceptor('file'))
  public async save(@Param('userId') userId: string, @UploadedFile() file: Express.Multer.File, @Req() request: Request, @Res() response: Response): Promise<Response<Result<string>>> {
    if(!isValidJwtUserId(request, response, userId)) return;
    
    const result = await this.avatarService.save(userId, file);
    if(result.error != null) return response.status(result.code ?? HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    
    return response.status(HttpStatus.OK).json(result);
  }
  
  /** アバター画像を削除する */
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/avatar')
  public async remove(@Param('userId') userId: string, @Req() request: Request, @Res() response: Response): Promise<Response<void>> {
    if(!isValidJwtUserId(request, response, userId)) return;
    
    const result = await this.avatarService.remove(userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.INTERNAL_SERVER_ERROR).json(result);
    
    return response.status(HttpStatus.NO_CONTENT).end();
  }
}
