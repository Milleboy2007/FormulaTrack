import { Module } from '@nestjs/common';
import { TrackService } from './track.service.js';
import { TrackController } from './track.controller.js';

@Module({
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
