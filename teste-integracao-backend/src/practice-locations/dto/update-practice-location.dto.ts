import { PartialType } from '@nestjs/swagger';
import { CreatePracticeLocationDto } from './create-practice-location.dto';

export class UpdatePracticeLocationDto extends PartialType(CreatePracticeLocationDto) {}
