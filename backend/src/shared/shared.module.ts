import { Module } from '@nestjs/common';

import { ConvertDtoService } from './services/convert-dto.service';

/** Shared Module */
@Module({
  providers: [
    ConvertDtoService
  ],
  // 共用できるようにエクスポートする
  exports: [
    ConvertDtoService
  ]
})
export class SharedModule { }
