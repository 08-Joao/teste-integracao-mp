import { PartialType } from '@nestjs/mapped-types';
import { CreateOnCallRequestDto, CreateOnCallProposalDto } from './create-on-call.dto';

export class UpdateOnCallRequestDto extends PartialType(CreateOnCallRequestDto) {}
export class UpdateOnCallProposalDto extends PartialType(CreateOnCallProposalDto) {}
