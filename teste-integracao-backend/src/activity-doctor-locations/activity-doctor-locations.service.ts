import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDoctorLocationDto } from './dto/create-activity-doctor-location.dto';
import { UpdateActivityDoctorLocationDto } from './dto/update-activity-doctor-location.dto';

@Injectable()
export class ActivityDoctorLocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createActivityDoctorLocationDto: CreateActivityDoctorLocationDto) {
    return this.prisma.activityDoctorLocation.create({
      data: createActivityDoctorLocationDto,
      include: {
        activityDoctor: {
          include: {
            activity: {
              include: {
                specialty: true,
              },
            },
            doctorProfile: true,
          },
        },
        practiceLocation: true,
      },
    });
  }

  async findAll() {
    return this.prisma.activityDoctorLocation.findMany({
      include: {
        activityDoctor: {
          include: {
            activity: {
              include: {
                specialty: true,
              },
            },
            doctorProfile: true,
          },
        },
        practiceLocation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByDoctorProfile(doctorProfileId: string) {
    return this.prisma.activityDoctorLocation.findMany({
      where: {
        practiceLocation: {
          doctorProfileId,
        },
      },
      include: {
        activityDoctor: {
          include: {
            activity: {
              include: {
                specialty: true,
              },
            },
            doctorProfile: true,
          },
        },
        practiceLocation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.activityDoctorLocation.findUnique({
      where: { id },
      include: {
        activityDoctor: {
          include: {
            activity: {
              include: {
                specialty: true,
              },
            },
            doctorProfile: true,
          },
        },
        practiceLocation: true,
        availabilitySlots: true,
      },
    });

    if (!location) {
      throw new NotFoundException(`Activity doctor location with ID ${id} not found`);
    }

    return location;
  }

  async update(id: string, updateActivityDoctorLocationDto: UpdateActivityDoctorLocationDto) {
    await this.findOne(id);

    return this.prisma.activityDoctorLocation.update({
      where: { id },
      data: updateActivityDoctorLocationDto,
      include: {
        activityDoctor: {
          include: {
            activity: true,
          },
        },
        practiceLocation: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.activityDoctorLocation.delete({
      where: { id },
    });
  }
}
