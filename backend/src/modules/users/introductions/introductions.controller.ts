import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Put, Query, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../../common/helpers/convert-case';
import { IntroductionApi } from '../../../common/types/introduction';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { isValidJwtUserId } from '../../../shared/helpers/is-valid-jwt-user-id';
import { IntroductionsService } from './introductions.service';

import type { Request, Response } from 'express';
import type { Result } from '../../../common/types/result';

/** Introductions Controller */
@Controller('api/users')
export class IntroductionsController {
  constructor(private readonly introductionsService: IntroductionsService) { }
  
  /** 指定ユーザの承認されている紹介一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/introductions')
  public async findAllApproved(@Param('userId') recipientUserId: string, @Res() response: Response): Promise<Response<Result<Array<IntroductionApi>>>> {
    const introductionEntities = await this.introductionsService.findAllApproved(recipientUserId);
    if(introductionEntities.error != null) return response.status(introductionEntities.code ?? HttpStatus.BAD_REQUEST).json(introductionEntities);
    
    const result = introductionEntities.result.map(introductionEntity => camelToSnakeCaseObject(introductionEntity));
    return response.status(HttpStatus.OK).json({ result });
  }
  
  /** 未承認の紹介一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/introductions/unapproved')
  public async findAllUnpproved(@Param('userId') recipientUserId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<Array<IntroductionApi>>>> {
    if(!isValidJwtUserId(request, response, recipientUserId)) return;  // 未承認の紹介を読めるのは紹介された側本人だけ
    
    const introductionEntities = await this.introductionsService.findAllUnapproved(recipientUserId);
    if(introductionEntities.error != null) return response.status(introductionEntities.code ?? HttpStatus.BAD_REQUEST).json(introductionEntities);
    
    const result = introductionEntities.result.map(introductionEntity => camelToSnakeCaseObject(introductionEntity));
    return response.status(HttpStatus.OK).json({ result });
  }
  
  /** 紹介者が書いた紹介1件を取得する */
  @UseGuards(JwtAuthGuard)
  @Get(':userId/introductions/:actorUserId')
  public async findOne(@Param('userId') recipientUserId: string, @Param('actorUserId') actorUserId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<IntroductionApi>>> {
    if(!isValidJwtUserId(request, response, actorUserId)) return;  // 紹介を書く側の本人確認
    
    const introductionEntity = await this.introductionsService.findOne(recipientUserId, actorUserId);
    if(introductionEntity.error != null) return response.status(introductionEntity.code ?? HttpStatus.BAD_REQUEST).json(introductionEntity);
    
    const result = camelToSnakeCaseObject(introductionEntity.result);
    return response.status(HttpStatus.OK).json({ result });
  }
  
  /** 紹介文を書く (新規投稿・未承認時点での修正・承認後の編集 = 未承認に戻る) */
  @UseGuards(JwtAuthGuard)
  @Put(':userId/introductions/:actorUserId')
  public async createOrUpdate(@Param('userId') recipientUserId: string, @Param('actorUserId') actorUserId: string, @Body('text') text: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<IntroductionApi>>> {
    if(!isValidJwtUserId(request, response, actorUserId)) return;  // 紹介文を書く人の本人確認
    
    const entityResult = await this.introductionsService.createOrUpdate(recipientUserId, actorUserId, text);
    if(entityResult.error != null) return response.status(entityResult.code ?? HttpStatus.BAD_REQUEST).json(entityResult);
    
    const result = camelToSnakeCaseObject(entityResult.result);
    return response.status(HttpStatus.OK).json({ result });
  }
  
  /** 紹介文を承認する */
  @UseGuards(JwtAuthGuard)
  @Patch(':userId/introductions/:actorUserId/approve')
  public async approve(@Param('userId') recipientUserId: string, @Param('actorUserId') actorUserId: string, @Req() request: Request, @Res() response: Response): Promise<Response<Result<IntroductionApi>>> {
    if(!isValidJwtUserId(request, response, recipientUserId)) return;  // 紹介文を書いてもらう側の本人確認
    
    const entityResult = await this.introductionsService.approve(recipientUserId, actorUserId);
    if(entityResult.error != null) return response.status(entityResult.code ?? HttpStatus.BAD_REQUEST).json(entityResult);
    
    const result = camelToSnakeCaseObject(entityResult.result);
    return response.status(HttpStatus.OK).json({ result });
  }
  
  /** 紹介文を却下する・承認済み紹介文を削除する */
  @UseGuards(JwtAuthGuard)
  @Delete(':userId/introductions/:actorUserId')
  public async remove(@Param('userId') recipientUserId: string, @Param('actorUserId') actorUserId: string, @Query('operator_user_id') operatorUserId: string, @Req() request: Request, @Res() response: Response): Promise<Response<void>> {
    if(operatorUserId === recipientUserId && !isValidJwtUserId(request, response, recipientUserId)) return;  // 操作するログインユーザが紹介される側だった場合の本人確認
    if(operatorUserId === actorUserId     && !isValidJwtUserId(request, response, actorUserId    )) return;  // 操作するログインユーザが紹介文を書く側だった場合の本人確認
    
    const result = await this.introductionsService.remove(recipientUserId, actorUserId);
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    return response.status(HttpStatus.NO_CONTENT).end();
  }
}
