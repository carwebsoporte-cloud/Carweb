import { Module } from '@nestjs/common';
import { ObdCodesController, ObdCategoriesController, ObdManufacturersController, ObdStatsController } from './obd-codes.controller';
import { ObdCodesService } from './obd-codes.service';

@Module({
  controllers: [ObdCodesController, ObdCategoriesController, ObdManufacturersController, ObdStatsController],
  providers: [ObdCodesService],
  exports: [ObdCodesService],
})
export class ObdCodesModule {}
