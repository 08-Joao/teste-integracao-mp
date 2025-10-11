export class Review {
  id: string;
  appointmentId: string;
  reviewerAccountId: string;
  revieweeAccountId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}
