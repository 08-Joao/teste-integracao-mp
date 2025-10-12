import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createActivityDto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: createActivityDto,
      include: {
        specialty: true,
      },
    });
  }

  async findAll() {
    return this.prisma.activity.findMany({
      include: {
        specialty: true,
        activityDoctors: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.activity.findUnique({
      where: { id },
      include: {
        specialty: true,
        activityDoctors: true,
      },
    });
  }

  async update(id: string, updateActivityDto: UpdateActivityDto) {
    return this.prisma.activity.update({
      where: { id },
      data: updateActivityDto,
      include: {
        specialty: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.activity.delete({
      where: { id },
    });
  }
}
