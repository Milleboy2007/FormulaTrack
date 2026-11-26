import { Injectable } from '@nestjs/common';
import { CreatePilotDto } from './dto/create-pilot.dto.js';
import { UpdatePilotDto } from './dto/update-pilot.dto.js';

@Injectable()
export class PilotService {
  create(createPilotDto: CreatePilotDto) {
    return 'This action adds a new pilot';
  }

  findAll() {
    return `This action returns all pilot`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pilot`;
  }

  update(id: number, updatePilotDto: UpdatePilotDto) {
    return `This action updates a #${id} pilot`;
  }

  remove(id: number) {
    return `This action removes a #${id} pilot`;
  }
}
