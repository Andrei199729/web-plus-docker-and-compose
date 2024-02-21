import {
  IsUrl,
  IsNumber,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateWishlistDto {
  @IsNumber({}, { each: true })
  itemsId: number[];

  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    message: 'Невалидный URL',
  })
  image: string;
}
