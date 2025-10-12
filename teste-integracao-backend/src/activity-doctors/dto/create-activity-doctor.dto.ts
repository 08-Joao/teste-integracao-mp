import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateActivityDoctorDto {
  @IsNotEmpty()
  @IsString()
  activityId: string;

  @IsNotEmpty()
  @IsString()
  doctorProfileId: string;

  @IsNumber()
  @Min(1)
  estimatedDuration: number;

  @IsOptional()
  @IsBoolean()
  show?: boolean;
}
