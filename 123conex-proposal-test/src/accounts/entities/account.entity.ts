import { AccountType } from "@prisma/client";


export class Account {
  id: string;
  userId: string;
  type: AccountType;
  createdAt: Date;
  updatedAt: Date;
}
