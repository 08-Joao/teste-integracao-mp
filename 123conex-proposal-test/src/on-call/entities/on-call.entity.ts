import { OnRequestStatus, OnProposalStatus } from '@prisma/client';

export class OnCallRequest {
  id: string;
  patientAccountId: string;
  activityId: string;
  radius: number;
  status: OnRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class OnCallProposal {
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
