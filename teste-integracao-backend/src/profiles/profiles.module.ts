import { Module } from '@nestjs/common';
import { DoctorService } from './doctor/doctor.service';
import { PatientService } from './patient/patient.service';
import { DoctorRepository } from './doctor/infrastructure/repositories/doctor.repository';
import { PatientRepository } from './patient/infrastructure/repositories/patient.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DoctorService, PatientService, DoctorRepository, PatientRepository],
  exports: [DoctorService, PatientService],
})
export class ProfilesModule {}
