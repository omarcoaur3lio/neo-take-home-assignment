import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for battle result
 */
export class BattleResultDto {
  @ApiProperty({
    description: 'Winner character ID',
    example: '1',
  })
  winnerId: string;

  @ApiProperty({
    description: 'Winner character name',
    example: 'Aragorn',
  })
  winnerName: string;

  @ApiProperty({
    description: 'Winner remaining HP',
    example: 15,
  })
  winnerRemainingHP: number;

  @ApiProperty({
    description: 'Loser character ID',
    example: '2',
  })
  loserId: string;

  @ApiProperty({
    description: 'Loser character name',
    example: 'Legolas',
  })
  loserName: string;

  @ApiProperty({
    description: 'Battle log with detailed turn-by-turn information',
    example: [
      'Battle between Aragorn (Warrior) - 20 HP and Legolas (Thief) - 15 HP begins!',
      'Aragorn 7 speed was faster than Legolas 5 speed and will begin this round.',
      'Aragorn attacks Legolas for 8, Legolas has 7 HP remaining.',
      'Legolas attacks Aragorn for 10, Aragorn has 10 HP remaining.',
      'Aragorn wins the battle! Aragorn still has 10 HP remaining!',
    ],
    type: [String],
  })
  log: string[];
}
