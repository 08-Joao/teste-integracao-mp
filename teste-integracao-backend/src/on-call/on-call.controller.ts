import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OnCallService } from './on-call.service';
import { CreateOnCallRequestDto, CreateOnCallProposalDto } from './dto/create-on-call.dto';
import { UpdateOnCallRequestDto, UpdateOnCallProposalDto } from './dto/update-on-call.dto';
import { OnRequestStatus } from 'generated/prisma';

@ApiTags('on-call')
@Controller('on-call')
export class OnCallController {
  constructor(private readonly onCallService: OnCallService) {}

  @Post('request')
  @ApiOperation({ 
    summary: 'Criar solicitação de atendimento domiciliar',
    description: 'Cria uma nova solicitação de atendimento domiciliar por um paciente'
  })
  @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  createRequest(@Body() createOnCallRequestDto: CreateOnCallRequestDto) {
    return this.onCallService.createRequest(createOnCallRequestDto);
  }

  @Post('proposal')
  @ApiOperation({ 
    summary: 'Criar proposta de atendimento',
    description: 'Cria uma proposta de atendimento domiciliar por um médico'
  })
  @ApiResponse({ status: 201, description: 'Proposta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  createProposal(@Body() createOnCallProposalDto: CreateOnCallProposalDto) {
    return this.onCallService.createProposal(createOnCallProposalDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar atendimentos domiciliares',
    description: 'Retorna todos os atendimentos domiciliares'
  })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  findAll() {
    return this.onCallService.findAll();
  }

  @Get('request/:id')
  findOneRequest(@Param('id') id: string) {
    return this.onCallService.findOneRequest(id);
  }

  @Get('proposal/:id')
  findOneProposal(@Param('id') id: string) {
    return this.onCallService.findOneProposal(id);
  }

  @Patch('request/:id')
  updateRequest(@Param('id') id: string, @Body() updateOnCallRequestDto: UpdateOnCallRequestDto) {
    return this.onCallService.updateRequest(id, updateOnCallRequestDto);
  }

  @Patch('proposal/:id')
  updateProposal(@Param('id') id: string, @Body() updateOnCallProposalDto: UpdateOnCallProposalDto) {
    return this.onCallService.updateProposal(id, updateOnCallProposalDto);
  }

  @Delete('request/:id')
  removeRequest(@Param('id') id: string) {
    return this.onCallService.removeRequest(id);
  }

  @Delete('proposal/:id')
  removeProposal(@Param('id') id: string) {
    return this.onCallService.removeProposal(id);
  }

  @Post('proposal/:id/accept')
  @ApiOperation({ 
    summary: 'Aceitar proposta com horário selecionado',
    description: 'Paciente aceita uma proposta de atendimento. Isso fecha o request e cancela outras proposals.'
  })
  @ApiResponse({ status: 200, description: 'Proposta aceita com sucesso' })
  @ApiResponse({ status: 400, description: 'Não autorizado ou request já fechado' })
  @ApiResponse({ status: 404, description: 'Proposta não encontrada' })
  acceptProposalWithTime(
    @Param('id') proposalId: string,
    @Body('selectedTime') selectedTime: string,
  ) {
    return this.onCallService.acceptProposalWithTime(proposalId, selectedTime);
  }

  @Post('proposal/:id/reject')
  @ApiOperation({ 
    summary: 'Rejeitar proposta',
    description: 'Rejeita uma proposta de atendimento domiciliar'
  })
  @ApiResponse({ status: 200, description: 'Proposta rejeitada com sucesso' })
  @ApiParam({ name: 'id', description: 'ID da proposta' })
  rejectProposalSimple(@Param('id') proposalId: string) {
    return this.onCallService.rejectProposalSimple(proposalId);
  }

  @Get('requests/open')
  @ApiOperation({ 
    summary: 'Listar requests abertos',
    description: 'Retorna todos os requests com status OPEN'
  })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  findOpenRequests() {
    return this.onCallService.findOpenRequests();
  }

  @Get('requests/closed')
  @ApiOperation({ 
    summary: 'Listar requests fechados (histórico)',
    description: 'Retorna todos os requests com status CLOSED'
  })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  findClosedRequests() {
    return this.onCallService.findClosedRequests();
  }

  @Get('requests/patient/:patientAccountId')
  @ApiOperation({ 
    summary: 'Listar requests de um paciente',
    description: 'Retorna todos os requests de um paciente específico'
  })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso' })
  findRequestsByPatient(
    @Param('patientAccountId') patientAccountId: string,
    @Query('status') status?: OnRequestStatus,
  ) {
    return this.onCallService.findRequestsByPatient(patientAccountId, status);
  }
}
