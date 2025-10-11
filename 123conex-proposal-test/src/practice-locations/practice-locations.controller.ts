import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PracticeLocationsService } from './practice-locations.service';
import { CreatePracticeLocationDto } from './dto/create-practice-location.dto';
import { UpdatePracticeLocationDto } from './dto/update-practice-location.dto';

@ApiTags('practice-locations')
@Controller('practice-locations')
export class PracticeLocationsController {
  constructor(private readonly practiceLocationsService: PracticeLocationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo local de prática' })
  @ApiResponse({ status: 201, description: 'Local criado com sucesso' })
  create(@Body() createPracticeLocationDto: CreatePracticeLocationDto) {
    return this.practiceLocationsService.create(createPracticeLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os locais de prática' })
  @ApiResponse({ status: 200, description: 'Lista de locais retornada com sucesso' })
  findAll(@Query('doctorProfileId') doctorProfileId?: string) {
    if (doctorProfileId) {
      return this.practiceLocationsService.findByDoctorProfile(doctorProfileId);
    }
    return this.practiceLocationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar local por ID' })
  @ApiResponse({ status: 200, description: 'Local encontrado' })
  @ApiResponse({ status: 404, description: 'Local não encontrado' })
  findOne(@Param('id') id: string) {
    return this.practiceLocationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar local' })
  @ApiResponse({ status: 200, description: 'Local atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updatePracticeLocationDto: UpdatePracticeLocationDto) {
    return this.practiceLocationsService.update(id, updatePracticeLocationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar local' })
  @ApiResponse({ status: 200, description: 'Local deletado com sucesso' })
  remove(@Param('id') id: string) {
    return this.practiceLocationsService.remove(id);
  }
}
