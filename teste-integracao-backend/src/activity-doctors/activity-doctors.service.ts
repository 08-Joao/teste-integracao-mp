import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDoctorDto } from './dto/create-activity-doctor.dto';
import { UpdateActivityDoctorDto } from './dto/update-activity-doctor.dto';

@Injectable()
export class ActivityDoctorsService {
  constructor(private prisma: PrismaService) {}

  async create(createActivityDoctorDto: CreateActivityDoctorDto) {
    // Validar que o doctorProfile existe
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { id: createActivityDoctorDto.doctorProfileId },
    });

    if (!doctorProfile) {
      throw new NotFoundException(`Doctor profile with ID ${createActivityDoctorDto.doctorProfileId} not found`);
    }

    return this.prisma.activityDoctor.create({
      data: createActivityDoctorDto,
      include: {
        activity: {
          include: {
            specialty: true,
          },
        },
        doctorProfile: true,
      },
    });
  }

  async findAll() {
    return this.prisma.activityDoctor.findMany({
      include: {
        activity: {
          include: {
            specialty: true,
          },
        },
        doctorProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByDoctorProfile(doctorProfileId: string) {
    return this.prisma.activityDoctor.findMany({
      where: { doctorProfileId },
      include: {
        activity: {
          include: {
            specialty: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const activityDoctor = await this.prisma.activityDoctor.findUnique({
      where: { id },
      include: {
        activity: {
          include: {
            specialty: true,
          },
        },
        doctorProfile: true,
        activityDoctorLocations: {
          include: {
            practiceLocation: true,
          },
        },
      },
    });

    if (!activityDoctor) {
      throw new NotFoundException(`Activity doctor with ID ${id} not found`);
    }

    return activityDoctor;
  }

  async update(id: string, updateActivityDoctorDto: UpdateActivityDoctorDto) {
    await this.findOne(id);

    return this.prisma.activityDoctor.update({
      where: { id },
      data: updateActivityDoctorDto,
      include: {
        activity: {
          include: {
            specialty: true,
          },
        },
        doctorProfile: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.activityDoctor.delete({
      where: { id },
    });
  }
}
