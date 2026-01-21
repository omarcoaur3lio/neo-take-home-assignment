import { Module } from '@nestjs/common';
import { CharactersModule } from './characters/characters.module';
import { BattlesModule } from './battles/battles.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [CharactersModule, BattlesModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
