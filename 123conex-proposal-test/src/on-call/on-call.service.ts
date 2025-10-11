import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOnCallRequestDto, CreateOnCallProposalDto } from './dto/create-on-call.dto';
import { UpdateOnCallRequestDto, UpdateOnCallProposalDto } from './dto/update-on-call.dto';
import { OnRequestStatus, OnProposalStatus } from '@prisma/client';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class OnCallService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createRequest(createOnCallRequestDto: CreateOnCallRequestDto) {
    const request = await this.prisma.onCallRequest.create({
      data: {
        ...createOnCallRequestDto,
        status: OnRequestStatus.OPEN,
      },
      include: {
        activity: {
          include: {
            specialty: true,
          },
        },
        patient: true,
      },
    });

    // Buscar todos os médicos que têm essa atividade cadastrada
    const doctorsWithActivity = await this.prisma.activityDoctor.findMany({
      where: {
        activityId: createOnCallRequestDto.activityId,
      },
      include: {
        doctorProfile: {
          include: {
            account: true,
          },
        },
      },
    });

    console.log('🔔 [OnCall] Request created:', request.id);
    console.log('🔔 [OnCall] Activity ID:', createOnCallRequestDto.activityId);
    console.log('🔔 [OnCall] Doctors with this activity:', doctorsWithActivity.length);

    // Notificar cada médico
    doctorsWithActivity.forEach((activityDoctor) => {
      console.log('🔔 [OnCall] Notifying doctor:', activityDoctor.doctorProfile.accountId);
      
      this.notificationsGateway.notifyDoctorNewRequest(
        activityDoctor.doctorProfile.accountId,
        {
          requestId: request.id,
          activityName: request.activity.name,
          specialtyName: request.activity.specialty?.name,
          radius: request.radius,
        },
      );
    });

    return request;
  }

  async createProposal(createOnCallProposalDto: CreateOnCallProposalDto) {
    // Validar que o practiceLocation pertence ao doctor
    const practiceLocation = await this.prisma.practiceLocation.findUnique({
      where: { id: createOnCallProposalDto.practiceLocationId },
    });

    if (!practiceLocation) {
      throw new NotFoundException('Practice location not found');
    }

    // Buscar o doctorProfile pelo accountId
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { accountId: createOnCallProposalDto.doctorAccountId },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    if (practiceLocation.doctorProfileId !== doctorProfile.id) {
      throw new BadRequestException('Practice location does not belong to this doctor');
    }

    // Verificar se o request existe e está OPEN
    const request = await this.prisma.onCallRequest.findUnique({
      where: { id: createOnCallProposalDto.requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== OnRequestStatus.OPEN) {
      throw new BadRequestException('Request is not open for proposals');
    }

    const proposal = await this.prisma.onCallProposal.create({
      data: {
        ...createOnCallProposalDto,
        availableTimes: createOnCallProposalDto.availableTimes.map(time => new Date(time)),
        status: OnProposalStatus.PROPOSAL_SENT,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        practiceLocation: true,
        request: {
          include: {
            activity: true,
          },
        },
      },
    });

    // Notificar o paciente sobre a nova proposta
    console.log('🔔 [OnCall] Proposal created:', proposal.id);
    console.log('🔔 [OnCall] Notifying patient:', request.patientAccountId);
    
    this.notificationsGateway.notifyPatientNewProposal(
      request.patientAccountId,
      {
        proposalId: proposal.id,
        doctorName: proposal.doctor.user.name,
        price: proposal.price,
        practiceLocation: proposal.practiceLocation.city,
      },
    );

    return proposal;
  }

  async findAll() {
    return this.prisma.onCallRequest.findMany({
      include: {
        patient: true,
        activity: {
          include: {
            specialty: true,
          },
        },
        proposals: {
          include: {
            doctor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneRequest(id: string) {
    return this.prisma.onCallRequest.findUnique({
      where: { id },
      include: {
        patient: true,
        activity: {
          include: {
            specialty: true,
          },
        },
        proposals: {
          include: {
            doctor: true,
          },
        },
      },
    });
  }

  async findOneProposal(id: string) {
    return this.prisma.onCallProposal.findUnique({
      where: { id },
      include: {
        doctor: true,
        request: {
          include: {
            patient: true,
          },
        },
      },
    });
  }

  async updateRequest(id: string, updateOnCallRequestDto: UpdateOnCallRequestDto) {
    return this.prisma.onCallRequest.update({
      where: { id },
      data: updateOnCallRequestDto,
    });
  }

  async updateProposal(id: string, updateOnCallProposalDto: UpdateOnCallProposalDto) {
    const data: any = { ...updateOnCallProposalDto };
    if (updateOnCallProposalDto.availableTimes) {
      data.availableTimes = updateOnCallProposalDto.availableTimes.map(time => new Date(time));
    }
    return this.prisma.onCallProposal.update({
      where: { id },
      data,
    });
  }

  async removeRequest(id: string) {
    return this.prisma.onCallRequest.delete({
      where: { id },
    });
  }

  async removeProposal(id: string) {
    return this.prisma.onCallProposal.delete({
      where: { id },
    });
  }

  async acceptProposal(proposalId: string, patientAccountId: string) {
    const proposal = await this.prisma.onCallProposal.findUnique({
      where: { id: proposalId },
      include: {
        request: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Verificar se o paciente é o dono do request
    if (proposal.request.patientAccountId !== patientAccountId) {
      throw new BadRequestException('You are not authorized to accept this proposal');
    }

    // Verificar se o request ainda está OPEN
    if (proposal.request.status !== OnRequestStatus.OPEN) {
      throw new BadRequestException('Request is already closed');
    }

    // Atualizar a proposal para CONFIRMED e o request para CLOSED
    return this.prisma.$transaction([
      this.prisma.onCallProposal.update({
        where: { id: proposalId },
        data: { status: OnProposalStatus.CONFIRMED },
      }),
      this.prisma.onCallRequest.update({
        where: { id: proposal.requestId },
        data: { status: OnRequestStatus.CLOSED },
      }),
      // Cancelar outras proposals do mesmo request
      this.prisma.onCallProposal.updateMany({
        where: {
          requestId: proposal.requestId,
          id: { not: proposalId },
          status: OnProposalStatus.PROPOSAL_SENT,
        },
        data: { status: OnProposalStatus.CANCELLED },
      }),
    ]);
  }

  async rejectProposal(proposalId: string, patientAccountId: string) {
    const proposal = await this.prisma.onCallProposal.findUnique({
      where: { id: proposalId },
      include: {
        request: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Verificar se o paciente é o dono do request
    if (proposal.request.patientAccountId !== patientAccountId) {
      throw new BadRequestException('You are not authorized to reject this proposal');
    }

    return this.prisma.onCallProposal.update({
      where: { id: proposalId },
      data: { status: OnProposalStatus.CANCELLED },
    });
  }

  async findOpenRequests() {
    return this.prisma.onCallRequest.findMany({
      where: { status: OnRequestStatus.OPEN },
      include: {
        patient: true,
        activity: {
          include: {
            specialty: true,
          },
        },
        proposals: {
          include: {
            doctor: true,
            practiceLocation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findClosedRequests() {
    return this.prisma.onCallRequest.findMany({
      where: { status: OnRequestStatus.CLOSED },
      include: {
        patient: true,
        activity: {
          include: {
            specialty: true,
          },
        },
        proposals: {
          include: {
            doctor: true,
            practiceLocation: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findRequestsByPatient(patientAccountId: string, status?: OnRequestStatus) {
    return this.prisma.onCallRequest.findMany({
      where: {
        patientAccountId,
        ...(status && { status }),
      },
      include: {
        activity: {
          include: {
            specialty: true,
          },
        },
        proposals: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
            practiceLocation: true,
          },
          orderBy: {
            createdAt: 'desc', // Propostas mais recentes primeiro
          },
        },
      },
      orderBy: [
        {
          status: 'asc', // OPEN primeiro (alfabeticamente antes de CLOSED)
        },
        {
          createdAt: 'desc', // Mais recentes primeiro
        },
      ],
    });
  }

  // Novos métodos simplificados
  async acceptProposalWithTime(proposalId: string, selectedTime: string) {
    const proposal = await this.prisma.onCallProposal.findUnique({
      where: { id: proposalId },
      include: {
        request: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Verificar se o request ainda está OPEN
    if (proposal.request.status !== OnRequestStatus.OPEN) {
      throw new BadRequestException('This request is already closed. You cannot accept proposals for closed requests.');
    }

    // Verificar se a proposta ainda está disponível
    if (proposal.status !== OnProposalStatus.PROPOSAL_SENT) {
      throw new BadRequestException('This proposal is no longer available.');
    }

    // Verificar se o horário selecionado está na lista de horários disponíveis
    const isTimeAvailable = proposal.availableTimes.some(
      (time) => new Date(time).toISOString() === new Date(selectedTime).toISOString()
    );

    if (!isTimeAvailable) {
      throw new BadRequestException('Selected time is not available');
    }

    // Atualizar a proposal para CONFIRMED, o request para CLOSED e cancelar outras proposals
    const result = await this.prisma.$transaction([
      // Atualizar a proposal aceita
      this.prisma.onCallProposal.update({
        where: { id: proposalId },
        data: { status: OnProposalStatus.CONFIRMED },
      }),
      // Fechar o request
      this.prisma.onCallRequest.update({
        where: { id: proposal.requestId },
        data: { status: OnRequestStatus.CLOSED },
      }),
      // Cancelar todas as outras proposals do mesmo request
      this.prisma.onCallProposal.updateMany({
        where: {
          requestId: proposal.requestId,
          id: { not: proposalId },
          status: OnProposalStatus.PROPOSAL_SENT,
        },
        data: { status: OnProposalStatus.CANCELLED },
      }),
    ]);

    console.log('✅ [OnCall] Proposal accepted:', proposalId);
    console.log('✅ [OnCall] Selected time:', selectedTime);
    console.log('✅ [OnCall] Request closed:', proposal.requestId);

    // Notificar o médico que a proposta foi aceita
    this.notificationsGateway.notifyDoctorProposalAccepted(
      proposal.doctorAccountId,
      {
        proposalId: proposal.id,
        patientName: proposal.request.patientAccountId, // TODO: Buscar nome do paciente
        selectedTime: selectedTime,
      },
    );

    return result[0];
  }

  async rejectProposalSimple(proposalId: string) {
    const proposal = await this.prisma.onCallProposal.findUnique({
      where: { id: proposalId },
      include: {
        request: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Verificar se o request ainda está OPEN
    if (proposal.request.status !== OnRequestStatus.OPEN) {
      throw new BadRequestException('This request is already closed. You cannot reject proposals for closed requests.');
    }

    // Verificar se a proposta ainda está disponível
    if (proposal.status !== OnProposalStatus.PROPOSAL_SENT) {
      throw new BadRequestException('This proposal is no longer available.');
    }

    // Atualizar o status para CANCELLED
    const updatedProposal = await this.prisma.onCallProposal.update({
      where: { id: proposalId },
      data: { status: OnProposalStatus.CANCELLED },
    });

    console.log('❌ [OnCall] Proposal rejected:', proposalId);

    // Notificar o médico que a proposta foi rejeitada
    this.notificationsGateway.notifyDoctorProposalRejected(
      proposal.doctorAccountId,
      {
        proposalId: proposal.id,
      },
    );

    return updatedProposal;
  }
}
