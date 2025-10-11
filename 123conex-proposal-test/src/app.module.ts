import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OnCallModule } from './on-call/on-call.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ActivitiesModule } from './activities/activities.module';
import { SpecialtiesModule } from './specialties/specialties.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { AccountsModule } from './accounts/accounts.module';
import { UsersModule } from './users/users.module';
import { PracticeLocationsModule } from './practice-locations/practice-locations.module';
import { ActivityDoctorsModule } from './activity-doctors/activity-doctors.module';
import { ActivityDoctorLocationsModule } from './activity-doctor-locations/activity-doctor-locations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AccountsModule,
    ProfilesModule,
    AuthModule,
    SpecialtiesModule,
    ActivitiesModule,
    ReviewsModule,
    AppointmentsModule,
    OnCallModule,
    PracticeLocationsModule,
    ActivityDoctorsModule,
    ActivityDoctorLocationsModule,
    NotificationsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
