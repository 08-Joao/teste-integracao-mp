import { AppointmentStatus } from '../enums/appointment-status.enum';
export declare class CreateAppointmentDto {
    patientAccountId: string;
    doctorAccountId: string;
    serviceId: string;
    dateTime: string;
    status: AppointmentStatus;
    price: number;
}
