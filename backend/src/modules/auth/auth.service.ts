import * as bcryptjs from 'bcryptjs';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/** Auth Service */
@Injectable()
export class AuthService {
  /** コストファクタ */
  private readonly saltRounds = 10;
  
  /** ダミーユーザデータ */
  private readonly dummyUsers = [
    {
      userId: 'anonymous',
      passwordHash: bcryptjs.hashSync('anonymous', bcryptjs.genSaltSync(this.saltRounds)),
      userName: 'ななし',
      role: 'Anonymous'
    },
    {
      userId: 'admin',
      passwordHash: bcryptjs.hashSync('admin', bcryptjs.genSaltSync(this.saltRounds)),
      userName: '管理者',
      role: 'Admin'
    }
  ];
  
  constructor(private readonly jwtService: JwtService) { }
  
  /** ログイン認証する */
  public async login(userId: string, password: string): Promise<Record<string, string>> {
    // TODO : 認証ロジックを追加する
    const user = this.dummyUsers.find(dummyUser => dummyUser.userId === userId);
    if(user == null) throw new UnauthorizedException();  // ユーザ名誤り
    
    const isValidPassword = await bcryptjs.compare(password, user.passwordHash);
    if(!isValidPassword) throw new UnauthorizedException();  // パスワード誤り
    
    const jwtPayload = {  // `JwtAuthGuard` の設定により、コレが `request.user` に入る
      sub : user.userId,
      role: user.role
    };
    const result = {
      userId     : user.userId,
      userName   : user.userName,
      role       : user.role,
      accessToken: await this.jwtService.signAsync(jwtPayload).catch(e => { console.error(e); return ''; })
    };
    return result;
  }
}
