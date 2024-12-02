import * as path from 'node:path';

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './core/configs/configuration';
import { AccessLogMiddleware } from './core/middlewares/access-log.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';

/** App Module */
@Module({
  imports: [
    // 環境変数を注入する
    ConfigModule.forRoot({
      isGlobal: true,  // 各 Module での `imports` を不要にする
      load: [configuration]  // 環境変数を読み取り適宜デフォルト値を割り当てるオブジェクトをロードする
    }),
    // JWT Token
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],  // `useFactory()` で使うサービスを注入する
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecret'),  // 環境変数から注入する
        signOptions: { expiresIn: '10 days' }  // JWT アクセストークンの有効期限 : https://github.com/vercel/ms
      })
    }),
    // 静的ファイル (クライアント) を配信する
    ServeStaticModule.forRootAsync({
      useFactory: () => [{
        rootPath: path.resolve(__dirname, '../../frontend/dist')
      }]
    }),
    // TypeORM
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('dbHost'),
        port: configService.get<number>('dbPort'),
        username: configService.get<string>('dbUser'),
        password: configService.get<string>('dbPass'),
        database: configService.get<string>('dbName'),
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: true,  // スキーマを自動同期する
        logging: true,
        autoLoadEntities: true  // forFeature() をなくす
      })
    }),
    
    SharedModule,
    AuthModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ]
})
export class AppModule {
  /** 独自のアクセスログ出力ミドルウェアを適用する */
  public configure(middlewareConsumer: MiddlewareConsumer): void {
    middlewareConsumer.apply(AccessLogMiddleware).forRoutes('*');
  }
}
