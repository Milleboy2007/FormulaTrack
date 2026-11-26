import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PilotService } from './pilot.service.js';
import { CreatePilotDto } from './dto/create-pilot.dto.js';
import { UpdatePilotDto } from './dto/update-pilot.dto.js';

@Controller('pilot')
export class PilotController {
  constructor(private readonly pilotService: PilotService) {}

  @Post()
  create(@Body() createPilotDto: CreatePilotDto) {
    return this.pilotService.create(createPilotDto);
  }

  @Get()
  findAll() {
    return this.pilotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pilotService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePilotDto: UpdatePilotDto) {
    return this.pilotService.update(+id, updatePilotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pilotService.remove(+id);
  }
}
