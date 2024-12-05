import { Controller, Get } from '@nestjs/common';

/** App Controller */
@Controller('')
export class AppController {
  @Get('robots.txt')
  public robotsTxt(): string {
    return 'User-agent: *\nDisallow: /\n';
  }
}
