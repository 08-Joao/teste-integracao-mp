import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorProfileDto {
  @ApiProperty({
    description: 'Se o médico está aprovado para atender',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  approved?: boolean;
}
