import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';

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
  
  /** 未読件数を取得する */
  @UseGuards(JwtAuthGuard)
  @Get('number-of-unreads')
  public async getNumberOfUnreads(@Query('user_id') userId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<number>>> {
    if(!isValidJwtUserId(request, response, userId)) return;
    
    const result = await this.notificationsService.getNumberOfUnreads(userId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.OK).json(result);
  }
  
  /** 通知を全て既読にする */
  @UseGuards(JwtAuthGuard)
  @Post('read')
  public async read(@Body('recipient_user_id') userId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<boolean>>> {
    if(!isValidJwtUserId(request, response, userId)) return;
    
    const notificationResult = await this.notificationsService.readAll(userId);
    if(notificationResult.error != null) return response.status(notificationResult.code ?? HttpStatus.BAD_REQUEST).json(notificationResult);
    
    return response.status(HttpStatus.OK).json({ result: true });
  }
}
