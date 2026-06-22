import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsPublicController, AdsAdminController } from './ads.controller';
import { BannersService } from './banners.service';
import { BannersPublicController, BannersAdminController } from './banners.controller';
import { AdminAuthController } from './admin-auth.controller';
import { UploadController } from './upload.controller';

@Module({
  controllers: [
    AdsPublicController,
    AdsAdminController,
    BannersPublicController,
    BannersAdminController,
    AdminAuthController,
    UploadController,
  ],
  providers: [AdsService, BannersService],
})
export class AdsModule {}
