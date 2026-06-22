import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { AdminGuard } from './admin.guard';

/** Público: GET /api/ads → anuncios activos ordenados por plan */
@Controller('api/ads')
export class AdsPublicController {
  constructor(private readonly ads: AdsService) {}

  @Get()
  findActive() {
    return this.ads.findActive();
  }
}

/** Admin (protegido): /api/admin/ads ... */
@Controller('api/admin/ads')
@UseGuards(AdminGuard)
export class AdsAdminController {
  constructor(private readonly ads: AdsService) {}

  @Get()
  findAll() {
    return this.ads.findAll();
  }

  @Post()
  create(@Body() body: CreateAdDto) {
    return this.ads.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAdDto) {
    return this.ads.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ads.remove(id);
  }
}
