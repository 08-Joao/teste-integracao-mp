import { Injectable } from "@nestjs/common";
import { IPatientRepository } from "../../domain/repositories/patient.repository";

@Injectable()
export class PatientRepository implements IPatientRepository {

}