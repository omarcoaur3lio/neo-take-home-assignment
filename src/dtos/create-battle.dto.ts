import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a battle between two characters
 */
export class CreateBattleDto {
  @ApiProperty({
    description: 'ID of the first character',
    example: '1',
  })
  @IsString()
  characterId1: string;

  @ApiProperty({
    description: 'ID of the second character',
    example: '2',
  })
  @IsString()
  characterId2: string;
}
