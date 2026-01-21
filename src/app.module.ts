import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CharactersModule } from './characters/characters.module';
import { BattlesModule } from './battles/battles.module';

@Module({
  imports: [CharactersModule, BattlesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
