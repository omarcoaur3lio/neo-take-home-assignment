import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BattlesService } from './battles.service';
import { CreateBattleDto } from '../dtos/create-battle.dto';
import { BattleResultDto } from '../dtos/battle-result.dto';

@ApiTags('battles')
@Controller('battles')
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post()
  @ApiOperation({ summary: 'Execute a battle between two characters' })
  @ApiResponse({
    status: 201,
    description: 'Battle executed successfully',
    type: BattleResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid characters (not found, dead, or same character)',
  })
  create(@Body() createBattleDto: CreateBattleDto): BattleResultDto {
    return this.battlesService.executeBattle(
      createBattleDto.characterId1,
      createBattleDto.characterId2,
    );
  }
}
