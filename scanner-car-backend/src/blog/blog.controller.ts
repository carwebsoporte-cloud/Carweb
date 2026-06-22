import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AdminGuard } from '../ads/admin.guard';

/** Público: artículos del blog. */
@Controller('api/blog')
export class BlogPublicController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  findPublished() {
    return this.blog.findPublished();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blog.findPublishedBySlug(slug);
  }
}

/** Admin (protegido): CRUD del blog. */
@Controller('api/admin/blog')
@UseGuards(AdminGuard)
export class BlogAdminController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  findAll() {
    return this.blog.findAll();
  }

  @Post()
  create(@Body() body: CreateBlogDto) {
    return this.blog.create(body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateBlogDto) {
    return this.blog.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blog.remove(id);
  }
}
