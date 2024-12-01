import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS を設定する
  app.enableCors();
  
  await app.listen(6666);
}
bootstrap();
