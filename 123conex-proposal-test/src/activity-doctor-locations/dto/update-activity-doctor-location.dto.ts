import { PartialType } from '@nestjs/swagger';
import { CreateActivityDoctorLocationDto } from './create-activity-doctor-location.dto';

export class UpdateActivityDoctorLocationDto extends PartialType(CreateActivityDoctorLocationDto) {}
