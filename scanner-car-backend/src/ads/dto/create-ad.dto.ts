import { IsString, IsOptional, IsBoolean, IsIn, IsUrl, MaxLength, IsNotEmpty } from 'class-validator';

/** Validación de un anuncio de vendedor (panel admin). */
export class CreateAdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  businessName!: string;

  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  imageUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  link?: string;

  @IsOptional()
  @IsIn(['PREMIUM', 'PRO', 'BASICO'])
  plan?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
