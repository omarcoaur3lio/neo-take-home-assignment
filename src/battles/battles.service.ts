import { Injectable, BadRequestException } from '@nestjs/common';
import { CharacterRepository } from '../repositories/character.repository';
import { Character } from '../models/character.model';
import { BattleResultDto } from '../dtos/battle-result.dto';

/**
 * Service for managing battle logic
 */
@Injectable()
export class BattlesService {
  constructor(private readonly characterRepository: CharacterRepository) {}

  /**
   * Execute a battle between two characters
   * @param characterId1 First character ID
   * @param characterId2 Second character ID
   * @returns Battle result with log
   */
  executeBattle(characterId1: string, characterId2: string): BattleResultDto {
    // Validate characters exist
    const char1 = this.characterRepository.findById(characterId1);
    const char2 = this.characterRepository.findById(characterId2);

    if (!char1) {
      throw new BadRequestException(
        `Character with ID ${characterId1} not found`,
      );
    }
    if (!char2) {
      throw new BadRequestException(
        `Character with ID ${characterId2} not found`,
      );
    }

    // Validate both characters are alive
    if (!char1.isAlive) {
      throw new BadRequestException(`${char1.name} is already dead`);
    }
    if (!char2.isAlive) {
      throw new BadRequestException(`${char2.name} is already dead`);
    }

    // Cannot battle same character
    if (characterId1 === characterId2) {
      throw new BadRequestException('Cannot battle the same character');
    }

    // Start battle
    const log: string[] = [];
    log.push(
      `Battle between ${char1.name} (${char1.job}) - ${char1.currentHP} HP and ${char2.name} (${char2.job}) - ${char2.currentHP} HP begins!`,
    );

    // Battle loop
    while (char1.isAlive && char2.isAlive) {
      this.executeRound(char1, char2, log);
    }

    // Determine winner and loser
    const winner = char1.isAlive ? char1 : char2;
    const loser = char1.isAlive ? char2 : char1;

    // Add final message
    log.push(
      `${winner.name} wins the battle! ${winner.name} still has ${winner.currentHP} HP remaining!`,
    );

    // Update characters in repository
    this.characterRepository.update(char1);
    this.characterRepository.update(char2);

    return {
      winnerId: winner.id,
      winnerName: winner.name,
      winnerRemainingHP: winner.currentHP,
      loserId: loser.id,
      loserName: loser.name,
      log,
    };
  }

  /**
   * Execute a single round of combat
   * @param char1 First character
   * @param char2 Second character
   * @param log Battle log array
   */
  private executeRound(
    char1: Character,
    char2: Character,
    log: string[],
  ): void {
    // Determine turn order based on speed
    const { first, second, speed1, speed2 } = this.determineTurnOrder(
      char1,
      char2,
    );

    // Log speed comparison
    log.push(
      `${first.name} ${speed1} speed was faster than ${second.name} ${speed2} speed and will begin this round.`,
    );

    // First character attacks
    this.executeAttack(first, second, log);

    // Check if second character is still alive to counter-attack
    if (second.isAlive) {
      this.executeAttack(second, first, log);
    }
  }

  /**
   * Determine which character goes first based on speed roll
   * Handles ties by re-rolling
   * @param char1 First character
   * @param char2 Second character
   * @returns Turn order with speed values
   */
  private determineTurnOrder(
    char1: Character,
    char2: Character,
  ): { first: Character; second: Character; speed1: number; speed2: number } {
    let speed1: number;
    let speed2: number;

    // Re-roll on ties
    do {
      speed1 = this.rollSpeed(char1);
      speed2 = this.rollSpeed(char2);
    } while (speed1 === speed2);

    if (speed1 > speed2) {
      return { first: char1, second: char2, speed1, speed2 };
    } else {
      return { first: char2, second: char1, speed1: speed2, speed2: speed1 };
    }
  }

  /**
   * Roll speed for a character (random 0 to speedModifier)
   * @param character Character
   * @returns Speed roll value
   */
  private rollSpeed(character: Character): number {
    return Math.floor(Math.random() * (character.speedModifier + 1));
  }

  /**
   * Execute an attack from attacker to defender
   * @param attacker Attacking character
   * @param defender Defending character
   * @param log Battle log array
   */
  private executeAttack(
    attacker: Character,
    defender: Character,
    log: string[],
  ): void {
    const damage = this.rollDamage(attacker);
    defender.takeDamage(damage);

    log.push(
      `${attacker.name} attacks ${defender.name} for ${damage}, ${defender.name} has ${defender.currentHP} HP remaining.`,
    );
  }

  /**
   * Roll damage for an attack (random 0 to attackModifier)
   * @param character Attacking character
   * @returns Damage value
   */
  private rollDamage(character: Character): number {
    return Math.floor(Math.random() * (character.attackModifier + 1));
  }
}
