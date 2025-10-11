import { AppointmentStatus } from '../enums/appointment-status.enum';

export interface CreateAppointmentDto {
  patientAccountId: string;
  doctorAccountId: string;
  serviceId: string;
  dateTime: string;
  status: AppointmentStatus;
  price: number;
}
