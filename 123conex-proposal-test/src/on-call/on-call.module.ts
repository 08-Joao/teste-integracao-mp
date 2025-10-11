import { Module } from '@nestjs/common';
import { OnCallService } from './on-call.service';
import { OnCallController } from './on-call.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [OnCallController],
  providers: [OnCallService],
})
export class OnCallModule {}
