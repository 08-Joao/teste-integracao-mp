import { AccountType } from '../enums/account-type.enum';

export interface User {
  id: string;
  email: string;
  accountType: AccountType;
  accountId: string;
}
