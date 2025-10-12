import { Activity } from './activity.entity';

export interface ActivityDoctorLocation {
  id: string;
  activityDoctorId: string;
  practiceLocationId: string;
  price: number;
  activityDoctor?: {
    activity: Activity;
  };
  practiceLocation?: {
    city: string;
    state: string;
    street: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
