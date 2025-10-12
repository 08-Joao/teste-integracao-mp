import { Module } from '@nestjs/common';
import { ActivityDoctorLocationsService } from './activity-doctor-locations.service';
import { ActivityDoctorLocationsController } from './activity-doctor-locations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityDoctorLocationsController],
  providers: [ActivityDoctorLocationsService],
})
export class ActivityDoctorLocationsModule {}
