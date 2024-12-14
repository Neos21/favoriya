import { Body, Controller, Get, HttpStatus, Param, ParseBoolPipe, ParseIntPipe, Patch, Query, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../shared/helpers/is-valid-jwt-user-id';
import { NotificationsService } from './notifications.service';

import type { Request, Response } from 'express';
import type { Result } from '../../common/types/result';
import type { NotificationApi } from '../../common/types/notification';

/** Notifications Service */
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }
  
  /** ログインユーザの通知一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get('')
  public async findAll(@Query('user_id') userId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<Array<NotificationApi>>>> {
    if(!isValidJwtUserId(request, response, userId)) return;
    
    const notificationsResult = await this.notificationsService.findAll(userId);
    if(notificationsResult.error != null) return response.status(notificationsResult.code ?? HttpStatus.BAD_REQUEST).json(notificationsResult);
    
    const notificationsApi = notificationsResult.result.map(notificationEntity => camelToSnakeCaseObject(notificationEntity));
    return response.status(HttpStatus.OK).json({ result: notificationsApi });
  }
  
  /** 通知を既読にする */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  public async read(@Param('id', ParseIntPipe) id: number, @Body('recipient_user_id') userId: string, @Body('is_read', ParseBoolPipe) isRead: boolean, @Req() request: Request, @Res() response: Response): Promise<Response<Result<boolean>>> {
    if(!isValidJwtUserId(request, response, userId)) return;
    if(isRead == null) return response.status(HttpStatus.BAD_REQUEST).json({ error: '既読処理に必要なパラメータが含まれていません' });
    
    const notificationResult = await this.notificationsService.read(id);
    if(notificationResult.error != null) return response.status(notificationResult.code ?? HttpStatus.BAD_REQUEST).json(notificationResult);
    
    return response.status(HttpStatus.OK).json({ result: true });
  }
}
