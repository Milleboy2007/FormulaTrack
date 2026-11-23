import { PartialType } from '@nestjs/mapped-types';
import { CreatePilotDto } from './create-pilot.dto.js';

export class UpdatePilotDto extends PartialType(CreatePilotDto) {}
