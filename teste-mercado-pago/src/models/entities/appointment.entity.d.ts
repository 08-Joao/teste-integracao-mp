import { AppointmentStatus } from '../enums/appointment-status.enum';

export interface Appointment {
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
