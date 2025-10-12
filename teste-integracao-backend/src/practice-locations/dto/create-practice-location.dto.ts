import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePracticeLocationDto {
  @IsNotEmpty()
  @IsString()
  zipCode: string;

  @IsNotEmpty()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsNotEmpty()
  @IsString()
  neighborhood: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  coordinates: string;

  @IsNotEmpty()
  @IsString()
  doctorProfileId: string;
}
