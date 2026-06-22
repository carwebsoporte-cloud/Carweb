import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { ObdCodesModule } from './obd-codes/obd-codes.module';
import { AdsModule } from './ads/ads.module';
import { BlogModule } from './blog/blog.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    // Config del rate-limiter. Se aplica selectivamente vía @UseGuards en
    // endpoints sensibles (p. ej. el login), NO de forma global: las lecturas
    // SSR del frontend salen todas desde una sola IP y un límite global las
    // estrangularía.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    ObdCodesModule,
    AdsModule,
    BlogModule,
    VehicleModule,
  ],
})
export class AppModule {}
