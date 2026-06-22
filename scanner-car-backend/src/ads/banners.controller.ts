import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { AdminGuard } from './admin.guard';

/** Público: GET /api/ad-banners → banners activos (todas las posiciones) */
@Controller('api/ad-banners')
export class BannersPublicController {
  constructor(private readonly banners: BannersService) {}

  @Get()
  findActive() {
    return this.banners.findActive();
  }
}

/** Admin (protegido): /api/admin/ad-banners ... */
@Controller('api/admin/ad-banners')
@UseGuards(AdminGuard)
export class BannersAdminController {
  constructor(private readonly banners: BannersService) {}

  @Get()
  findAll() {
    return this.banners.findAll();
  }

  @Post()
  create(@Body() body: CreateBannerDto) {
    return this.banners.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBannerDto) {
    return this.banners.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.banners.remove(id);
  }
}
