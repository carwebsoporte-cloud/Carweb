import { Module } from '@nestjs/common';
import { ObdCodesController, ObdCategoriesController, ObdManufacturersController, ObdStatsController } from './obd-codes.controller';
import { ObdCodesService } from './obd-codes.service';
import { SeoPolicyService } from '../seo/seo-policy.service';

@Module({
  controllers: [ObdCodesController, ObdCategoriesController, ObdManufacturersController, ObdStatsController],
  providers: [ObdCodesService, SeoPolicyService],
  exports: [ObdCodesService],
})
export class ObdCodesModule {}
