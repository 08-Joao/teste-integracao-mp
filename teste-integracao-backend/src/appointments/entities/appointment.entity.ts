import { AppointmentStatus } from 'generated/prisma';

export class Appointment {
  id: string;
  patientAccountId: string;
  doctorAccountId: string;
  serviceId: string;
  dateTime: Date;
  status: AppointmentStatus;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
