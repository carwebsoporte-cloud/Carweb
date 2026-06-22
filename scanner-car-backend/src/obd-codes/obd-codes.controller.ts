import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ObdCodesService } from './obd-codes.service';

// Idiomas soportados. El base (es) vive en las columnas del código; el resto
// se superpone desde la tabla de traducciones. Cualquier valor no soportado
// recae en el idioma base.
const SUPPORTED_LOCALES = ['es', 'en', 'pt', 'fr'];
function normalizeLocale(locale?: string): string {
  const l = (locale ?? '').toLowerCase().slice(0, 2);
  return SUPPORTED_LOCALES.includes(l) ? l : 'es';
}

@ApiTags('OBD Codes')
@Controller('api/codes')
export class ObdCodesController {
  constructor(private readonly obdCodesService: ObdCodesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los códigos OBD2 con paginación' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Códigos por página (default: 50)' })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma del contenido: es (default), en, pt, fr' })
  @ApiResponse({ status: 200, description: 'Lista paginada de códigos OBD2' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.obdCodesService.findAll(pageNum, limitNum, normalizeLocale(locale));
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar códigos (autocomplete o resultados completos)' })
  @ApiQuery({ name: 'q', required: true, description: 'Término de búsqueda' })
  @ApiQuery({ name: 'limit', required: false, description: 'Máximo de resultados (default: 5, máx: 100)' })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma del contenido: es (default), en, pt, fr' })
  @ApiResponse({ status: 200, description: 'Lista de códigos que coinciden' })
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ) {
    if (!query || query.length < 2) {
      return [];
    }
    const limitNum = Math.min(limit ? parseInt(limit, 10) || 5 : 5, 100);
    return this.obdCodesService.search(query, limitNum, normalizeLocale(locale));
  }

  @Get('by-symptom')
  @ApiOperation({ summary: 'Buscar códigos por síntoma (ej: "ralentí inestable")' })
  @ApiQuery({ name: 'q', required: true, description: 'Síntoma a buscar (mín. 3 caracteres)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Máximo de resultados (default: 12, máx: 50)' })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma del contenido: es (default), en' })
  @ApiResponse({ status: 200, description: 'Códigos cuyo síntoma coincide con el término' })
  async searchBySymptom(@Query('q') query: string, @Query('limit') limit?: string, @Query('locale') locale?: string) {
    if (!query || query.trim().length < 3) return [];
    const limitNum = Math.min(limit ? parseInt(limit, 10) || 12 : 12, 50);
    return this.obdCodesService.searchBySymptom(query, limitNum, normalizeLocale(locale));
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Obtener códigos por categoría con paginación' })
  @ApiParam({ name: 'category', description: 'Categoría: P, B, C o U' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Códigos por página' })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma del contenido: es (default), en, pt, fr' })
  @ApiResponse({ status: 200, description: 'Lista paginada de códigos de la categoría' })
  async findByCategory(
    @Param('category') category: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.obdCodesService.findByCategory(category, pageNum, limitNum, normalizeLocale(locale));
  }

  @Get(':code/related')
  @ApiOperation({ summary: 'Obtener códigos relacionados' })
  @ApiParam({ name: 'code', description: 'Código OBD2 base' })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma del contenido: es (default), en, pt, fr' })
  @ApiResponse({ status: 200, description: 'Lista de códigos relacionados' })
  async findRelated(@Param('code') code: string, @Query('locale') locale?: string) {
    return this.obdCodesService.findRelated(code, 6, normalizeLocale(locale));
  }

  @Get(':code/variants')
  @ApiOperation({ summary: 'Variantes de un código por fabricante (genérico SAE + OEM)' })
  @ApiParam({ name: 'code', description: 'Código OBD2 (ej: P1133)' })
  @ApiResponse({ status: 200, description: 'Lista de fabricantes que definen este código, con su título' })
  async findVariants(@Param('code') code: string) {
    return this.obdCodesService.findVariants(code);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Obtener un código específico con síntomas, causas y soluciones' })
  @ApiParam({ name: 'code', description: 'Código OBD2 (ej: P0420)' })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma del contenido: es (default), en, pt, fr' })
  @ApiQuery({ name: 'manufacturer', required: false, description: 'Slug del fabricante para la variante específica (ej: toyota). Por defecto, la definición genérica SAE.' })
  @ApiResponse({ status: 200, description: 'Información completa del código' })
  @ApiResponse({ status: 404, description: 'Código no encontrado' })
  async findByCode(
    @Param('code') code: string,
    @Query('locale') locale?: string,
    @Query('manufacturer') manufacturer?: string,
  ) {
    const obdCode = await this.obdCodesService.findByCode(code, normalizeLocale(locale), manufacturer);
    if (!obdCode) {
      throw new NotFoundException(`Código ${code.toUpperCase()} no encontrado`);
    }
    return obdCode;
  }
}

@ApiTags('Categories')
@Controller('api/categories')
export class ObdCategoriesController {
  constructor(private readonly obdCodesService: ObdCodesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las categorías OBD2 desde la BD' })
  @ApiResponse({ status: 200, description: 'Lista de categorías con conteo de códigos' })
  async findAll() {
    return this.obdCodesService.findAllCategories();
  }
}

@ApiTags('Manufacturers')
@Controller('api/manufacturers')
export class ObdManufacturersController {
  constructor(private readonly obdCodesService: ObdCodesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los fabricantes con conteo de códigos' })
  @ApiResponse({ status: 200, description: 'Lista de fabricantes (el genérico SAE primero)' })
  async findAll() {
    return this.obdCodesService.findAllManufacturers();
  }

  @Get(':slug/codes')
  @ApiOperation({ summary: 'Códigos de un fabricante (paginado)' })
  @ApiParam({ name: 'slug', description: 'Slug del fabricante (ej: toyota, chevrolet)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'locale', required: false, description: 'Idioma del contenido: es (default), en' })
  @ApiResponse({ status: 200, description: 'Lista paginada de códigos del fabricante' })
  @ApiResponse({ status: 404, description: 'Fabricante no encontrado' })
  async findCodes(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const result = await this.obdCodesService.findByManufacturer(slug, pageNum, limitNum, normalizeLocale(locale));
    if (!result) throw new NotFoundException(`Fabricante "${slug}" no encontrado`);
    return result;
  }
}

@ApiTags('Stats')
@Controller('api/stats')
export class ObdStatsController {
  constructor(private readonly obdCodesService: ObdCodesService) {}

  @Get()
  @ApiOperation({ summary: 'Métricas globales: códigos, síntomas, causas y soluciones' })
  @ApiResponse({ status: 200, description: 'Conteos totales de la enciclopedia' })
  async findStats() {
    return this.obdCodesService.findStats();
  }
}
