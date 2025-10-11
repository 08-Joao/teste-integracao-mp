import { Module } from '@nestjs/common';
import { ActivityDoctorsService } from './activity-doctors.service';
import { ActivityDoctorsController } from './activity-doctors.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityDoctorsController],
  providers: [ActivityDoctorsService],
})
export class ActivityDoctorsModule {}
