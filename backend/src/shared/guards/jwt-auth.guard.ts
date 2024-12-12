import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';

import type { Request } from 'express';

/** JWT Auth Guard */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(JwtAuthGuard.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) { }
  
  /**
   * JWT 認証する
   * 
   * @return 認証成功なら `true`
   * @throws 認証失敗時
   */
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if(token == null) throw new UnauthorizedException();  // リクエストヘッダから Bearer トークンが取得できなかった
    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        { secret: this.configService.get<string>('jwtSecret') }
      );
      request.user = payload;  // リクエストオブジェクトのこの名前に Payload が入るようにする
    }
    catch(error) {
      if(error instanceof TokenExpiredError) {
        this.logger.warn('トークン有効期限切れ', error);
      }
      else {
        this.logger.warn('トークン認証不正', error);
      }
      this.decodeToken(token);
      throw new UnauthorizedException();  // JWT 認証不正
    }
    return true;
  }
  
  /** リクエストヘッダから Bearer トークンを取得する */
  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
  
  /** トークンの内容をログ出力する */
  private async decodeToken(token: string): Promise<void> {
    try {
      const decodedPayload = await this.jwtService.decode(token);
      this.logger.log('トークンデコード結果', decodedPayload);
    }
    catch(error) {
      this.logger.warn('トークンデコード失敗', error);
    }
  }
}
