import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SigninDoctorDto {
  @ApiProperty({
    description: 'Email do médico',
    example: 'maria.santos@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do médico',
    example: 'MinhaSenh@123',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
