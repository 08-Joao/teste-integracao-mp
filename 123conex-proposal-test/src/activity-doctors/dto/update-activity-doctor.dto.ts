import { PartialType } from '@nestjs/swagger';
import { CreateActivityDoctorDto } from './create-activity-doctor.dto';

export class UpdateActivityDoctorDto extends PartialType(CreateActivityDoctorDto) {}
