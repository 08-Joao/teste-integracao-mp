import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateActivityDoctorLocationDto {
  @IsNotEmpty()
  @IsString()
  activityDoctorId: string;

  @IsNotEmpty()
  @IsString()
  practiceLocationId: string;

  @IsNumber()
  @Min(0)
  price: number;
}
