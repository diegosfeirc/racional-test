import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Endpoint de salud de la API',
    description: 'Retorna un mensaje de bienvenida',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje de bienvenida',
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
