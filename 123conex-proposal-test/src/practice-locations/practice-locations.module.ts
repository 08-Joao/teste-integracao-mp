import { Module } from '@nestjs/common';
import { PracticeLocationsService } from './practice-locations.service';
import { PracticeLocationsController } from './practice-locations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PracticeLocationsController],
  providers: [PracticeLocationsService],
})
export class PracticeLocationsModule {}
