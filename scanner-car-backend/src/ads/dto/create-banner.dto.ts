import { IsString, IsOptional, IsBoolean, IsIn, IsUrl, MaxLength } from 'class-validator';

/** Validación de un banner publicitario por posición (panel admin). */
export class CreateBannerDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsIn(['LEFT', 'RIGHT', 'BOTTOM'])
  slot!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  imageUrl!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  link!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
