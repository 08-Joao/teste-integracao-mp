export interface CreateReviewDto {
  appointmentId: string;
  reviewerAccountId: string;
  revieweeAccountId: string;
  rating: number;
  comment: string;
}
