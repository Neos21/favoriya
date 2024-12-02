import { Injectable } from '@nestjs/common';

/** App Service */
@Injectable()
export class AppService {
  public getHello(): string {
    return 'Hello World!';
  }
}
