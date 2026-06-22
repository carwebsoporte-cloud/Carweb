import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { AdminGuard } from './admin.guard';

/** Forma mínima del archivo de Multer (evita depender de @types/multer) */
interface UploadedImage {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const ALLOWED = /^image\/(jpe?g|png|webp|gif|avif)$/i;
const EXT: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png',
  'image/webp': '.webp', 'image/gif': '.gif', 'image/avif': '.avif',
};

@Controller('api/admin')
@UseGuards(AdminGuard)
export class UploadController {
  /** POST /api/admin/upload (multipart, campo "file") → { url } */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 6 * 1024 * 1024 } }))
  upload(@UploadedFile() file: UploadedImage) {
    if (!file || !file.buffer) throw new BadRequestException('No se envió ninguna imagen');
    if (!ALLOWED.test(file.mimetype)) {
      throw new BadRequestException('Formato no permitido (usa JPG, PNG, WEBP, GIF o AVIF)');
    }

    const dir = path.resolve(process.cwd(), 'uploads');
    fs.mkdirSync(dir, { recursive: true });

    const ext = EXT[file.mimetype.toLowerCase()] || '.jpg';
    const name = `ad-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    fs.writeFileSync(path.join(dir, name), file.buffer);

    const base = process.env.PUBLIC_BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
    return { url: `${base}/uploads/${name}` };
  }
}
