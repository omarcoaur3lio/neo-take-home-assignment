import { IsEnum, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobType } from '../models/job.model';

export class CreateCharacterDto {
  @ApiProperty({
    description:
      'Character name (4-15 characters, letters and underscores only)',
    example: 'Aragorn',
    minLength: 4,
    maxLength: 15,
    pattern: '^[a-zA-Z_]{4,15}$',
  })
  @IsString()
  @Matches(/^[a-zA-Z_]{4,15}$/, {
    message:
      'Name must contain only letters or underscore and be between 4 and 15 characters',
  })
  name: string;

  @ApiProperty({
    description: 'Character job class',
    enum: JobType,
    example: JobType.WARRIOR,
  })
  @IsEnum(JobType, {
    message: `Job must be one of: ${Object.values(JobType).join(', ')}`,
  })
  job: JobType;
}
