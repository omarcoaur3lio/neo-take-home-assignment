import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../models/job.model';
import { Character } from '../models/character.model';

export class CharacterListItemDto {
  @ApiProperty({ description: 'Character unique identifier', example: '1' })
  id: string;

  @ApiProperty({ description: 'Character name', example: 'Bob' })
  name: string;

  @ApiProperty({
    description: 'Character job class',
    enum: JobType,
    example: JobType.WARRIOR,
  })
  job: JobType;

  @ApiProperty({
    description: 'Character status',
    enum: ['Alive', 'Dead'],
    example: 'Alive',
  })
  status: 'Alive' | 'Dead';

  static fromCharacter(character: Character): CharacterListItemDto {
    return {
      id: character.id,
      name: character.name,
      job: character.job,
      status: character.isAlive ? 'Alive' : 'Dead',
    };
  }
}
