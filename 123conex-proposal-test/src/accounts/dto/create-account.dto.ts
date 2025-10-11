import { AccountType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsEnum(AccountType)
  type: AccountType;
}
