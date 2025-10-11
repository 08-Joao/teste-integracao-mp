import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePracticeLocationDto } from './dto/create-practice-location.dto';
import { UpdatePracticeLocationDto } from './dto/update-practice-location.dto';

@Injectable()
export class PracticeLocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createPracticeLocationDto: CreatePracticeLocationDto) {
    // Validar que o doctorProfile existe
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { id: createPracticeLocationDto.doctorProfileId },
    });

    if (!doctorProfile) {
      throw new NotFoundException(`Doctor profile with ID ${createPracticeLocationDto.doctorProfileId} not found`);
    }

    return this.prisma.practiceLocation.create({
      data: createPracticeLocationDto,
      include: {
        doctorProfile: true,
      },
    });
  }

  async findAll() {
    return this.prisma.practiceLocation.findMany({
      include: {
        doctorProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByDoctorProfile(doctorProfileId: string) {
    return this.prisma.practiceLocation.findMany({
      where: { doctorProfileId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.practiceLocation.findUnique({
      where: { id },
      include: {
        doctorProfile: true,
        activityDoctorLocations: {
          include: {
            activityDoctor: {
              include: {
                activity: true,
              },
            },
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundException(`Practice location with ID ${id} not found`);
    }

    return location;
  }

  async update(id: string, updatePracticeLocationDto: UpdatePracticeLocationDto) {
    await this.findOne(id);

    return this.prisma.practiceLocation.update({
      where: { id },
      data: updatePracticeLocationDto,
      include: {
        doctorProfile: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.practiceLocation.delete({
      where: { id },
    });
  }
}
