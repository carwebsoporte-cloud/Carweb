import { PartialType } from '@nestjs/swagger';
import { CreateBannerDto } from './create-banner.dto';

/** Todos los campos opcionales para PATCH. */
export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
