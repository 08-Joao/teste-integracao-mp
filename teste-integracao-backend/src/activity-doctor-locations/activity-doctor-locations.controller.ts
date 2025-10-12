import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ActivityDoctorLocationsService } from './activity-doctor-locations.service';
import { CreateActivityDoctorLocationDto } from './dto/create-activity-doctor-location.dto';
import { UpdateActivityDoctorLocationDto } from './dto/update-activity-doctor-location.dto';

@ApiTags('activity-doctor-locations')
@Controller('activity-doctor-locations')
export class ActivityDoctorLocationsController {
  constructor(private readonly activityDoctorLocationsService: ActivityDoctorLocationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar vínculo de atividade-médico-local' })
  @ApiResponse({ status: 201, description: 'Vínculo criado com sucesso' })
  create(@Body() createActivityDoctorLocationDto: CreateActivityDoctorLocationDto) {
    return this.activityDoctorLocationsService.create(createActivityDoctorLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os vínculos' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  @ApiQuery({ name: 'doctorProfileId', required: false, description: 'Filtrar por ID do médico' })
  findAll(@Query('doctorProfileId') doctorProfileId?: string) {
    if (doctorProfileId) {
      return this.activityDoctorLocationsService.findByDoctorProfile(doctorProfileId);
    }
    return this.activityDoctorLocationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar vínculo por ID' })
  @ApiResponse({ status: 200, description: 'Vínculo encontrado' })
  @ApiResponse({ status: 404, description: 'Vínculo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.activityDoctorLocationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar vínculo' })
  @ApiResponse({ status: 200, description: 'Vínculo atualizado com sucesso' })
  update(@Param('id') id: string, @Body() updateActivityDoctorLocationDto: UpdateActivityDoctorLocationDto) {
    return this.activityDoctorLocationsService.update(id, updateActivityDoctorLocationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar vínculo' })
  @ApiResponse({ status: 200, description: 'Vínculo deletado com sucesso' })
  remove(@Param('id') id: string) {
    return this.activityDoctorLocationsService.remove(id);
  }
}
