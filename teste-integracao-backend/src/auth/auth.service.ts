import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { DoctorService } from '../profiles/doctor/doctor.service';
import { PatientService } from '../profiles/patient/patient.service';
import { PrismaService } from '../prisma/prisma.service';
import { SigninPatientDto } from './dto/signin-patient.dto';
import { SigninDoctorDto } from './dto/signin-doctor.dto';
import { SignupPatientDto } from './dto/signup-patient.dto';
import { SignupDoctorDto } from './dto/signup-doctor.dto';
import { comparePassword, hashPassword } from '../utils/bcrypt.util';
import { AccountType } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signupPatient(signupPatientDto: SignupPatientDto) {
    const { name, email, password } = signupPatientDto;

    // Use Prisma transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (prisma) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: await hashPassword(password),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      // Create account
      const account = await prisma.account.create({
        data: {
          userId: user.id,
          type: AccountType.CLIENT,
        }
      });

      // Create patient profile
      const patientProfile = await prisma.patientProfile.create({
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

      return { user, account, patientProfile };
    });

    // Generate JWT token after transaction
    let token: string;
    try {
      token = this.jwtService.sign({
        sub: result.user.id,
        email: result.user.email,
        accountType: AccountType.CLIENT,
        accountId: result.account.id,
      });
    } catch (jwtError) {
      // If JWT fails, rollback the transaction by deleting the created records
      console.error('JWT generation failed, rolling back transaction:', jwtError);
      await this.prisma.$transaction(async (prisma) => {
        await prisma.patientProfile.delete({ where: { accountId: result.account.id } });
        await prisma.account.delete({ where: { id: result.account.id } });
        await prisma.user.delete({ where: { id: result.user.id } });
      });
      throw jwtError;
    }

    return {
      user: result.user,
      profile: result.patientProfile,
      token,
    };
  }

  async signupDoctor(signupDoctorDto: SignupDoctorDto) {
    const { name, email, password } = signupDoctorDto;

    // Use Prisma transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (prisma) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: await hashPassword(password),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      // Create account
      const account = await prisma.account.create({
        data: {
          userId: user.id,
          type: AccountType.PROFESSIONAL,
        }
      });

      // Create doctor profile (not approved by default)
      const doctorProfile = await prisma.doctorProfile.create({
        data: {
          accountId: account.id,
          approved: false,
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

      return { user, account, doctorProfile };
    });

    // Generate JWT token after transaction
    let token: string;
    try {
      token = this.jwtService.sign({
        sub: result.user.id,
        email: result.user.email,
        accountType: AccountType.PROFESSIONAL,
        accountId: result.account.id,
      });
    } catch (jwtError) {
      // If JWT fails, rollback the transaction by deleting the created records
      console.error('JWT generation failed, rolling back transaction:', jwtError);
      await this.prisma.$transaction(async (prisma) => {
        await prisma.doctorProfile.delete({ where: { accountId: result.account.id } });
        await prisma.account.delete({ where: { id: result.account.id } });
        await prisma.user.delete({ where: { id: result.user.id } });
      });
      throw jwtError;
    }

    return {
      user: result.user,
      profile: result.doctorProfile,
      token,
    };
  }

  async signinPatient(signinPatientDto: SigninPatientDto) {
    const { email, password } = signinPatientDto;

    // Find user with accounts
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find patient account
    const patientAccount = user.accounts.find(
      account => account.type === AccountType.CLIENT && account.patientProfile
    );

    if (!patientAccount) {
      throw new UnauthorizedException('Patient account not found');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      accountType: AccountType.CLIENT,
      accountId: patientAccount.id,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      profile: patientAccount.patientProfile,
      token,
    };
  }

  async signinDoctor(signinDoctorDto: SigninDoctorDto) {
    const { email, password } = signinDoctorDto;

    // Find user with accounts
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find doctor account
    const doctorAccount = user.accounts.find(
      account => account.type === AccountType.PROFESSIONAL && account.doctorProfile
    );

    if (!doctorAccount) {
      throw new UnauthorizedException('Doctor account not found');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      accountType: AccountType.PROFESSIONAL,
      accountId: doctorAccount.id,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      profile: doctorAccount.doctorProfile,
      token,
    };
  }

  async validateUser(payload: any) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
