import { AppointmentStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';


export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  patientAccountId: string;

  @IsNotEmpty()
  @IsString()
  doctorAccountId: string;

  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @IsDateString()
  dateTime: string;

  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @IsNumber()
  @Min(0)
  price: number;
}
