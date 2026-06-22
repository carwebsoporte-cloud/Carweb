import { PartialType } from '@nestjs/swagger';
import { CreateBlogDto } from './create-blog.dto';

/** Todos los campos opcionales para PATCH. */
export class UpdateBlogDto extends PartialType(CreateBlogDto) {}
