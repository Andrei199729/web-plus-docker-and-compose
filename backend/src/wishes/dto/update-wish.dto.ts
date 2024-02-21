import {
  Min,
  Max,
  IsUrl,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateWishDto {
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    message: 'Невалидный URL',
  })
  link: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    message: 'Невалидный URL',
  })
  image: string;

  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;

  @IsString()
  @Min(1)
  @Max(1024)
  description: string;
}
