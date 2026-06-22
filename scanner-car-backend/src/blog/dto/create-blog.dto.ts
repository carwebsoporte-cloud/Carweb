import { IsString, IsOptional, IsBoolean, MaxLength, IsNotEmpty, IsDateString } from 'class-validator';

/** Validación de un artículo de blog (panel admin). El español es obligatorio. */
export class CreateBlogDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverUrl?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  titleEs!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerptEs?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  bodyEs?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerptEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  bodyEn?: string;
}
