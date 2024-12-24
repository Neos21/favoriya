import { Controller, Delete, HttpStatus, ParseIntPipe, Query, Req, Res, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtAdminRole } from '../../../shared/helpers/is-valid-jwt-admin-role';
import { AdminEmojisService } from './admin-emojis.service';

import type { Request, Response } from 'express';

/** Admin Emojis Controller */
@Controller('api/admin/emojis')
export class AdminEmojisController {
  constructor(private readonly adminEmojisService: AdminEmojisService) { }
  
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
