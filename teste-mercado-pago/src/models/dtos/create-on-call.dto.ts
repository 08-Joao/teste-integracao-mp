import { OnRequestStatus } from '../enums/on-call-status.enum';

export interface CreateOnCallRequestDto {
  patientAccountId: string;
  activityId: string;
  radius: number;
}

export interface CreateOnCallProposalDto {
  doctorAccountId: string;
  requestId: string;
  price: number;
  practiceLocationId: string;
  availableTimes: string[];
}
