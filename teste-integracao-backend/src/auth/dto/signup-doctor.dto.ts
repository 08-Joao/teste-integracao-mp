import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDoctorDto {
  @ApiProperty({
    description: 'Nome completo do médico',
    example: 'Dr. Maria Santos',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email do médico',
    example: 'maria.santos@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do médico (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 símbolo)',
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
