import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from '../dtos/create-character.dto';
import { CharacterResponseDto } from '../dtos/character-response.dto';
import { CharacterListItemDto } from '../dtos/character-list-item.dto';

@ApiTags('characters')
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new character' })
  @ApiResponse({
    status: 201,
    description: 'Character created successfully',
    type: CharacterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input (name or job validation failed)',
  })
  create(@Body() createCharacterDto: CreateCharacterDto): CharacterResponseDto {
    const character = this.charactersService.create(createCharacterDto);
    return CharacterResponseDto.fromCharacter(character);
  }

  @Get()
  @ApiOperation({ summary: 'Get all characters' })
  @ApiResponse({
    status: 200,
    description: 'List of all characters',
    type: [CharacterListItemDto],
  })
  findAll(): CharacterListItemDto[] {
    const characters = this.charactersService.findAll();
    return characters.map((char) => CharacterListItemDto.fromCharacter(char));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get character details by ID' })
  @ApiParam({ name: 'id', description: 'Character ID' })
  @ApiResponse({
    status: 200,
    description: 'Character details',
    type: CharacterResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Character not found',
  })
  findOne(@Param('id') id: string): CharacterResponseDto {
    const character = this.charactersService.findOne(id);
    return CharacterResponseDto.fromCharacter(character);
  }
}
