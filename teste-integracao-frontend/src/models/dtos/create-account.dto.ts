import { AccountType } from '../enums/account-type.enum';

export interface CreateAccountDto {
  userId: string;
  type: AccountType;
}
