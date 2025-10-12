import { AccountType } from 'generated/prisma';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsEnum(AccountType)
  type: AccountType;
}
