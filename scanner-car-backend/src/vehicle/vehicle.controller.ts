import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { VehicleService } from './vehicle.service';

@ApiTags('Vehicle')
@Controller('api/vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get('vin/:vin')
  @ApiOperation({ summary: 'Decodificar un VIN (NHTSA vPIC): marca, modelo, año, motor…' })
  @ApiParam({ name: 'vin', description: 'Número de identificación vehicular (17 caracteres)' })
  @ApiResponse({ status: 200, description: 'Datos decodificados del vehículo (valid:false si el VIN es inválido)' })
  async decode(@Param('vin') vin: string) {
    return this.vehicleService.decodeVin(vin);
  }

  @Get('recalls')
  @ApiOperation({ summary: 'Llamados a revisión (recalls NHTSA) por marca/modelo/año' })
  @ApiQuery({ name: 'make', required: true })
  @ApiQuery({ name: 'model', required: true })
  @ApiQuery({ name: 'year', required: true })
  @ApiResponse({ status: 200, description: 'Conteo y lista de recalls del vehículo' })
  async recalls(@Query('make') make: string, @Query('model') model: string, @Query('year') year: string) {
    return this.vehicleService.getRecalls(make, model, year);
  }
}
