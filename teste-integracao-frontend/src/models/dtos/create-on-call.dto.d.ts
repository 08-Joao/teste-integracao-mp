export declare class CreateOnCallRequestDto {
    patientAccountId: string;
    activityDoctorLocationId: string;
    radius: number;
}
export declare class CreateOnCallProposalDto {
    doctorAccountId: string;
    requestId: string;
    price: number;
    practiceLocationId: string;
    availableTimes: string[];
}
