import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PilotModule } from './module/pilot/pilot.module.js';
import { UserModule } from './module/user/user.module.js';
import { TrackModule } from './module/track/track.module.js';
import { RaceModule } from './module/race/race.module.js';

@Module({
  imports: [PilotModule, UserModule, TrackModule, RaceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
