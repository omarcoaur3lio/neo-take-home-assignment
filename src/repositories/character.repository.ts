import { Injectable } from '@nestjs/common';
import { Character } from '../models/character.model';

/**
 * In-memory repository for Character entities
 * Uses Map for O(1) lookups by ID
 */
@Injectable()
export class CharacterRepository {
  private readonly characters = new Map<string, Character>();
  private idCounter = 1;

  /**
   * Generate unique ID for new character
   */
  private generateId(): string {
    return (this.idCounter++).toString();
  }

  /**
   * Save a new character to storage
   * @param character Character to save
   * @returns Saved character with generated ID
   */
  save(character: Character): Character {
    if (!character.id) {
      character.id = this.generateId();
    }
    this.characters.set(character.id, character);
    return character;
  }

  /**
   * Find character by ID
   * @param id Character ID
   * @returns Character if found, undefined otherwise
   */
  findById(id: string): Character | undefined {
    return this.characters.get(id);
  }

  /**
   * Find all characters
   * @returns Array of all characters
   */
  findAll(): Character[] {
    return Array.from(this.characters.values());
  }

  /**
   * Update existing character
   * @param character Character to update
   * @returns Updated character
   */
  update(character: Character): Character {
    this.characters.set(character.id, character);
    return character;
  }

  /**
   * Delete character by ID
   * @param id Character ID
   * @returns True if deleted, false if not found
   */
  delete(id: string): boolean {
    return this.characters.delete(id);
  }

  /**
   * Check if character exists by ID
   * @param id Character ID
   * @returns True if exists, false otherwise
   */
  exists(id: string): boolean {
    return this.characters.has(id);
  }

  /**
   * Clear all characters (useful for testing)
   */
  clear(): void {
    this.characters.clear();
    this.idCounter = 1;
  }

  /**
   * Get total number of characters
   */
  count(): number {
    return this.characters.size;
  }
}
