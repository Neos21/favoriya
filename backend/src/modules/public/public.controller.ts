import { Controller, Get, HttpStatus, Res } from '@nestjs/common';

import { PublicService } from './public.service';

import type { Result } from '../../common/types/result';
import type { Response } from 'express';

/** Public Controller */
@Controller('api/public')
export class PublicController {
  constructor(private readonly publicService: PublicService) { }
  
  /** ユーザ数を取得する */
  @Get('number-of-users')
  public async getNumberOfUsers(@Res() response: Response): Promise<Response<Result<number>>> {
    const result = await this.publicService.getNumberOfUsers();
    return response.status(HttpStatus.OK).json(result);
  }
}
