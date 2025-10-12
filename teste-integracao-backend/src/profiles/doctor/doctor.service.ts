import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { AccountType } from '@prisma/client';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, createDoctorProfileDto: CreateDoctorProfileDto) {
    // First create the account
    const account = await this.prisma.account.create({
      data: {
        userId,
        type: AccountType.PROFESSIONAL,
      }
    });

    // Then create the doctor profile
    const doctorProfile = await this.prisma.doctorProfile.create({
      data: {
        accountId: account.id,
        approved: createDoctorProfileDto.approved ?? false,
      },
      include: {
        account: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    return doctorProfile;
  }

  async findProfileByAccountId(accountId: string) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { accountId },
      include: {
        account: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return profile;
  }

  async updateProfile(accountId: string, updateDoctorProfileDto: UpdateDoctorProfileDto) {
    await this.findProfileByAccountId(accountId);

    return this.prisma.doctorProfile.update({
      where: { accountId },
      data: updateDoctorProfileDto,
      include: {
        account: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });
  }

  async deleteProfile(accountId: string) {
    await this.findProfileByAccountId(accountId);
    
    // Delete the account (cascade will delete the profile)
    return this.prisma.account.delete({
      where: { id: accountId }
    });
  }
}
