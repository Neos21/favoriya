import { Controller, Get, HttpStatus, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { camelToSnakeCaseObject } from '../../common/helpers/convert-case';
import { EmojiApi } from '../../common/types/emoji';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { EmojisService } from './emojis.service';

import type { Response } from 'express';
import type { Result } from '../../common/types/result';

/** Emojis Controller */
@Controller('api/emojis')
export class EmojisController {
  constructor(private readonly emojisService: EmojisService) { }
  
  /** 絵文字リアクション画像一覧を取得する */
  @UseGuards(JwtAuthGuard)
  @Get('')
  @UseInterceptors(FileInterceptor('file'))
  public async findAll(@Res() response: Response): Promise<Response<Result<Array<EmojiApi>>>> {
    const result = await this.emojisService.findAll();
    if(result.error != null) return response.status(result.code ?? HttpStatus.BAD_REQUEST).json(result);
    
    const emojisApi = result.result.map(emojiEntity => camelToSnakeCaseObject(emojiEntity));
    return response.status(HttpStatus.OK).json({ result: emojisApi });
  }
}
