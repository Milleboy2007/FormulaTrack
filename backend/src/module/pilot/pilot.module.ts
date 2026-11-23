import { Module } from '@nestjs/common';
import { PilotService } from './pilot.service.js';
import { PilotController } from './pilot.controller.js';

@Module({
  controllers: [PilotController],
  providers: [PilotService],
})
export class PilotModule {}
