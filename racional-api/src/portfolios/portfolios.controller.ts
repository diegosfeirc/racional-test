import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioResponseDto } from './dto/portfolio-response.dto';
import { PortfolioTotalResponseDto } from './dto/portfolio-total-response.dto';

@ApiTags('portfolios')
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfoliosService: PortfoliosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo portafolio',
    description: 'Crea un nuevo portafolio para un usuario',
  })
  @ApiBody({ type: CreatePortfolioDto })
  @ApiResponse({
    status: 201,
    description: 'Portafolio creado exitosamente',
    type: PortfolioResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un portafolio con ese nombre para el usuario',
  })
  async create(
    @Body(ValidationPipe) createPortfolioDto: CreatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    return this.portfoliosService.create(createPortfolioDto);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener todos los portafolios de un usuario',
    description:
      'Retorna todos los portafolios asociados a un usuario específico',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID del usuario',
    example: 'user-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de portafolios del usuario',
    type: [PortfolioResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findAllByUserId(
    @Param('userId') userId: string,
  ): Promise<PortfolioResponseDto[]> {
    return this.portfoliosService.findAllByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un portafolio por ID',
    description: 'Retorna la información de un portafolio específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del portafolio',
    example: 'portfolio-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Portafolio encontrado',
    type: PortfolioResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Portafolio no encontrado' })
  async findOne(@Param('id') id: string): Promise<PortfolioResponseDto> {
    return this.portfoliosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un portafolio',
    description: 'Actualiza la información de un portafolio existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del portafolio',
    example: 'portfolio-123',
  })
  @ApiBody({ type: UpdatePortfolioDto })
  @ApiResponse({
    status: 200,
    description: 'Portafolio actualizado exitosamente',
    type: PortfolioResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Portafolio no encontrado' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePortfolioDto: UpdatePortfolioDto,
  ): Promise<PortfolioResponseDto> {
    return this.portfoliosService.update(id, updatePortfolioDto);
  }

  @Get(':id/total')
  @ApiOperation({
    summary: 'Obtener el valor total de un portafolio',
    description:
      'Calcula y retorna el valor total del portafolio incluyendo todos los holdings con sus precios actuales',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del portafolio',
    example: 'portfolio-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Valor total del portafolio con detalles de holdings',
    type: PortfolioTotalResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Portafolio no encontrado' })
  async getTotalByPortfolioId(
    @Param('id') id: string,
  ): Promise<PortfolioTotalResponseDto> {
    return this.portfoliosService.getTotalByPortfolioId(id);
  }
}
