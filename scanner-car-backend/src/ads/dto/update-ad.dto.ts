import { PartialType } from '@nestjs/swagger';
import { CreateAdDto } from './create-ad.dto';

/** Todos los campos opcionales para PATCH. */
export class UpdateAdDto extends PartialType(CreateAdDto) {}
