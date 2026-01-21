import { Injectable, NotFoundException } from '@nestjs/common';
import { CharacterRepository } from '../repositories/character.repository';
import { Character } from '../models/character.model';
import { CreateCharacterDto } from '../dtos/create-character.dto';

/**
 * Service for managing character business logic
 */
@Injectable()
export class CharactersService {
  constructor(private readonly characterRepository: CharacterRepository) {}

  /**
   * Create a new character
   * @param createCharacterDto Character creation data
   * @returns Created character
   */
  create(createCharacterDto: CreateCharacterDto): Character {
    const character = new Character(
      '',
      createCharacterDto.name,
      createCharacterDto.job,
    );

    return this.characterRepository.save(character);
  }

  /**
   * Get all characters
   * @returns Array of all characters
   */
  findAll(): Character[] {
    return this.characterRepository.findAll();
  }

  /**
   * Get character by ID
   * @param id Character ID
   * @returns Character if found
   * @throws NotFoundException if character not found
   */
  findOne(id: string): Character {
    const character = this.characterRepository.findById(id);

    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    return character;
  }
}
