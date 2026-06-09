import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { BannersService, HeroBannerDto } from './banners.service';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get('hero/:key')
  getHero(@Param('key') key: string) {
    return this.bannersService.getHero(key);
  }

  @Get('hero')
  getHeroMain() {
    return this.bannersService.getHero('main');
  }

  @Put('hero/:key')
  upsertHero(
    @Param('key') key: string,
    @Body() body: Partial<Omit<HeroBannerDto, 'key'>>,
  ) {
    return this.bannersService.upsertHero(key, body);
  }
}
