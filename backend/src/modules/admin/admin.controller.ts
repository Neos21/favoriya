import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';

import { camelToSnakeCaseObject } from '../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { isValidJwtAdminRole } from '../../shared/helpers/is-valid-jwt-admin-role';
import { AdminService } from './admin.service';

import type { Request, Response } from 'express';
import type { Result } from '../../common/types/result';
import type { ServerMetricsApi } from '../../common/types/admin/server-metrics';
import type { UserApi } from '../../common/types/user';

/** Admin Controller */
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }
  
  /** サーバメトリクスを取得する */
  @UseGuards(JwtAuthGuard)
  @Get('server-metrics')
  public async getServerMetrics(@Req() request: Request, @Res() response: Response): Promise<Response<Result<ServerMetricsApi>>> {
    if(!isValidJwtAdminRole(request, response)) return;
    
    const result = await this.adminService.getServerMetrics();
    return response.status(HttpStatus.OK).json({ result: camelToSnakeCaseObject(result.result) });
  }
  
  /** ユーザごとの最終ログイン日時を取得する */
  @UseGuards(JwtAuthGuard)
  @Get('users-with-latest-login')
  public async getUsersWithLatestLogin(@Req() request: Request, @Res() response: Response): Promise<Response<Result<Array<UserApi>>>> {
    if(!isValidJwtAdminRole(request, response)) return;
    
    const result = await this.adminService.getUsersWithLatestLogin();
    return response.status(HttpStatus.OK).json({ result: camelToSnakeCaseObject(result.result) });
  }
}
