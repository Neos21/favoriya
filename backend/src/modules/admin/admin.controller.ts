import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';

import { snakeToCamelCaseObject } from '../../common/helpers/convert-case';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { isValidJwtAdminRole } from '../../shared/helpers/is-valid-jwt-admin-role';
import { AdminService } from './admin.service';

import type { Request, Response } from 'express';
import type { Result } from '../../common/types/result';
import type { ServerMetricsApi } from '../../common/types/admin/server-metrics';

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
    return response.status(HttpStatus.OK).json({ result: snakeToCamelCaseObject(result.result) });
  }
}
