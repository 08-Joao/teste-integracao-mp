import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateOnCallRequestDto {
  @IsNotEmpty()
  @IsString()
  patientAccountId: string;

  @IsNotEmpty()
  @IsString()
  activityId: string; // A atividade que o paciente precisa

  @IsNumber()
  @Min(0)
  radius: number;
}

export class CreateOnCallProposalDto {
  @IsNotEmpty()
  @IsString()
  doctorAccountId: string;

  @IsNotEmpty()
  @IsString()
  requestId: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsString()
  practiceLocationId: string;

  @IsArray()
  @IsDateString({}, { each: true })
  availableTimes: string[];
}
