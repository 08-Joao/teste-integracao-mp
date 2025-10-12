import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { AccountType } from 'generated/prisma';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, createPatientProfileDto: CreatePatientProfileDto) {
    // First create the account
    const account = await this.prisma.account.create({
      data: {
        userId,
        type: AccountType.CLIENT,
      }
    });

    // Then create the patient profile
    const patientProfile = await this.prisma.patientProfile.create({
      data: {
        accountId: account.id,
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

    return patientProfile;
  }

  async findProfileByAccountId(accountId: string) {
    const profile = await this.prisma.patientProfile.findUnique({
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
      throw new NotFoundException('Patient profile not found');
    }

    return profile;
  }

  async updateProfile(accountId: string, updatePatientProfileDto: UpdatePatientProfileDto) {
    await this.findProfileByAccountId(accountId);

    return this.prisma.patientProfile.update({
      where: { accountId },
      data: updatePatientProfileDto,
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
