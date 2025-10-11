export interface CreateActivityDoctorLocationDto {
  activityDoctorId: string;
  practiceLocationId: string;
  price: number;
}

export interface UpdateActivityDoctorLocationDto {
  price?: number;
}
