import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupPatientDto {
  @ApiProperty({
    description: 'Nome completo do paciente',
    example: 'João Silva',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email do paciente',
    example: 'joao.silva@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do paciente (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 símbolo)',
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
