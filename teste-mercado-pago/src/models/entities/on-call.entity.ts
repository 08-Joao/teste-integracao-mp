import { OnRequestStatus, OnProposalStatus } from '../enums/on-call-status.enum';

export interface OnCallRequest {
  id: string;
  patientAccountId: string;
  activityId: string;
  radius: number;
  status: OnRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnCallProposal {
  id: string;
  doctorAccountId: string;
  requestId: string;
  price: number;
  practiceLocationId: string;
  availableTimes: Date[];
  status: OnProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}
