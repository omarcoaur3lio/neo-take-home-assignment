import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../models/job.model';
import { Character } from '../models/character.model';

export class CharacterResponseDto {
  @ApiProperty({ description: 'Character unique identifier', example: '1' })
  id: string;

  @ApiProperty({ description: 'Character name', example: 'Aragorn' })
  name: string;

  @ApiProperty({
    description: 'Character job class',
    enum: JobType,
    example: JobType.WARRIOR,
  })
  job: JobType;

  @ApiProperty({ description: 'Current health points', example: 20 })
  currentHP: number;

  @ApiProperty({ description: 'Maximum health points', example: 20 })
  maxHP: number;

  @ApiProperty({ description: 'Strength stat', example: 10 })
  strength: number;

  @ApiProperty({ description: 'Dexterity stat', example: 5 })
  dexterity: number;

  @ApiProperty({ description: 'Intelligence stat', example: 5 })
  intelligence: number;

  @ApiProperty({
    description: 'Calculated attack modifier',
    example: 9,
  })
  attackModifier: number;

  @ApiProperty({
    description: 'Calculated speed modifier',
    example: 4,
  })
  speedModifier: number;

  @ApiProperty({ description: 'Whether character is alive', example: true })
  isAlive: boolean;

  static fromCharacter(character: Character): CharacterResponseDto {
    return {
      id: character.id,
      name: character.name,
      job: character.job,
      currentHP: character.currentHP,
      maxHP: character.maxHP,
      strength: character.strength,
      dexterity: character.dexterity,
      intelligence: character.intelligence,
      attackModifier: character.attackModifier,
      speedModifier: character.speedModifier,
      isAlive: character.isAlive,
    };
  }
}
