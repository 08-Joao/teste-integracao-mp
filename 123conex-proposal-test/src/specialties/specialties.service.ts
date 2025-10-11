import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtiesService {
  constructor(private prisma: PrismaService) {}

  async create(createSpecialtyDto: CreateSpecialtyDto) {
    return this.prisma.specialty.create({
      data: createSpecialtyDto,
    });
  }

  async findAll() {
    return this.prisma.specialty.findMany({
      include: {
        activities: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.specialty.findUnique({
      where: { id },
      include: {
        activities: true,
      },
    });
  }

  async update(id: string, updateSpecialtyDto: UpdateSpecialtyDto) {
    return this.prisma.specialty.update({
      where: { id },
      data: updateSpecialtyDto,
    });
  }

  async remove(id: string) {
    return this.prisma.specialty.delete({
      where: { id },
    });
  }
}
