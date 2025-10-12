import { AccountType } from "generated/prisma";


export class Account {
  id: string;
  userId: string;
  type: AccountType;
  createdAt: Date;
  updatedAt: Date;
}
