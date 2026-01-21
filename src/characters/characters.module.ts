import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CharacterRepository } from '../repositories/character.repository';

@Module({
  controllers: [CharactersController],
  providers: [CharactersService, CharacterRepository],
  exports: [CharactersService, CharacterRepository],
})
export class CharactersModule {}
