import { AccountType } from "../enums/account-type.enum";


export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  createdAt: Date;
  updatedAt: Date;
}
