import { NestMinioModule } from 'nestjs-minio';
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
import { AdminController } from './modules/admin/admin.controller';
import { AdminService } from './modules/admin/admin.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';
import { NotificationsController } from './modules/notifications/notifications.controller';
import { NotificationsService } from './modules/notifications/notifications.service';
import { PublicController } from './modules/public/public.controller';
import { PublicService } from './modules/public/public.service';
import { TimelineController } from './modules/timeline/timeline.controller';
import { TimelineService } from './modules/timeline/timeline.service';
import { TopicsService } from './modules/topics/topics.service';
import { AvatarController } from './modules/users/avatar/avatar.controller';
import { AvatarService } from './modules/users/avatar/avatar.service';
import { FollowersController } from './modules/users/followers/followers.controller';
import { FollowersService } from './modules/users/followers/followers.service';
import { FollowingsController } from './modules/users/followings/followings.controller';
import { FollowingsService } from './modules/users/followings/followings.service';
import { IntroductionsController } from './modules/users/introductions/introductions.controller';
import { IntroductionsService } from './modules/users/introductions/introductions.service';
import { LoginHistoriesController } from './modules/users/login-histories/login-histories.controller';
import { LoginHistoriesService } from './modules/users/login-histories/login-histories.service';
import { FavouritesController } from './modules/users/posts/favourites/favourites.controller';
import { FavouritesService } from './modules/users/posts/favourites/favourites.service';
import { PostDecorationService } from './modules/users/posts/post-decoration.service';
import { PostValidationService } from './modules/users/posts/post-validation.service';
import { PostsController } from './modules/users/posts/posts.controller';
import { PostsService } from './modules/users/posts/posts.service';
import { UsersController } from './modules/users/users.controller';
import { UsersService } from './modules/users/users.service';
import { FavouriteEntity } from './shared/entities/favourite.entity';
import { FollowEntity } from './shared/entities/follow.entity';
import { IntroductionEntity } from './shared/entities/introduction.entity';
import { LoginHistoryEntity } from './shared/entities/login-history.entity';
import { NotificationEntity } from './shared/entities/notification.entity';
import { PostEntity } from './shared/entities/post.entity';
import { TopicEntity } from './shared/entities/topic.entity';
import { UserEntity } from './shared/entities/user.entity';

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
        type    : 'postgres',
        host    : configService.get<string>('dbHost'),
        port    : configService.get<number>('dbPort'),
        username: configService.get<string>('dbUser'),
        password: configService.get<string>('dbPass'),
        database: configService.get<string>('dbName'),
        entities: [`${__dirname}/**/*.entity{.ts,.js}`],
        synchronize: true,  // スキーマを自動同期する
        logging: true,
        autoLoadEntities: true
      })
    }),
    TypeOrmModule.forFeature([
      FavouriteEntity,
      FollowEntity,
      IntroductionEntity,
      LoginHistoryEntity,
      NotificationEntity,
      PostEntity,
      TopicEntity,
      UserEntity
    ]),
    // MinIO
    NestMinioModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal : true,
        endPoint : configService.get<string>('ossHost'),
        port     : configService.get<number>('ossPort'),
        accessKey: configService.get<string>('ossUser'),
        secretKey: configService.get<string>('ossPass'),
        useSSL   : configService.get<boolean>('ossSsl')
      })
    })
  ],
  controllers: [
    AppController,
    
    AdminController,
    AuthController,
    AvatarController,
    FavouritesController,
    FollowersController,
    FollowingsController,
    IntroductionsController,
    LoginHistoriesController,
    NotificationsController,
    PostsController,
    PublicController,
    TimelineController,
    UsersController
  ],
  providers: [
    AppService,
    
    AdminService,
    AuthService,
    AvatarService,
    FavouritesService,
    FollowersService,
    FollowingsService,
    IntroductionsService,
    LoginHistoriesService,
    NotificationsService,
    PostsService,
    PostDecorationService,
    PostValidationService,
    PublicService,
    TimelineService,
    TopicsService,
    UsersService
  ]
})
export class AppModule {
  /** 独自のアクセスログ出力ミドルウェアを適用する */
  public configure(middlewareConsumer: MiddlewareConsumer): void {
    middlewareConsumer.apply(AccessLogMiddleware).forRoutes('*');
  }
}
