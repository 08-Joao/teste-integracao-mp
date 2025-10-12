import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ActivityDoctorsService } from './activity-doctors.service';
import { CreateActivityDoctorDto } from './dto/create-activity-doctor.dto';
import { UpdateActivityDoctorDto } from './dto/update-activity-doctor.dto';

@ApiTags('activity-doctors')
@Controller('activity-doctors')
export class ActivityDoctorsController {
  constructor(private readonly activityDoctorsService: ActivityDoctorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Vincular atividade ao médico' })
  @ApiResponse({ status: 201, description: 'Atividade vinculada com sucesso' })
  create(@Body() createActivityDoctorDto: CreateActivityDoctorDto) {
    return this.activityDoctorsService.create(createActivityDoctorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as atividades dos médicos' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  findAll(@Query('doctorProfileId') doctorProfileId?: string) {
    if (doctorProfileId) {
      return this.activityDoctorsService.findByDoctorProfile(doctorProfileId);
    }
    return this.activityDoctorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar atividade do médico por ID' })
  @ApiResponse({ status: 200, description: 'Atividade encontrada' })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada' })
  findOne(@Param('id') id: string) {
    return this.activityDoctorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar atividade do médico' })
  @ApiResponse({ status: 200, description: 'Atividade atualizada com sucesso' })
  update(@Param('id') id: string, @Body() updateActivityDoctorDto: UpdateActivityDoctorDto) {
    return this.activityDoctorsService.update(id, updateActivityDoctorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar atividade do médico' })
  @ApiResponse({ status: 200, description: 'Atividade deletada com sucesso' })
  remove(@Param('id') id: string) {
    return this.activityDoctorsService.remove(id);
  }
}
