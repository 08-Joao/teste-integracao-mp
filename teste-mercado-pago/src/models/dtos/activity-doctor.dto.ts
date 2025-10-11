export interface CreateActivityDoctorDto {
  activityId: string;
  doctorProfileId: string;
  estimatedDuration: number;
  show?: boolean;
}

export interface UpdateActivityDoctorDto {
  activityId?: string;
  estimatedDuration?: number;
  show?: boolean;
}
