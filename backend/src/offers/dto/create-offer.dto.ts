import { IsBoolean, IsDecimal, IsNumber, Max, Min } from 'class-validator';

export class CreateOfferDto {
  @IsNumber()
  itemId: number;

  @IsNumber()
  @IsDecimal(
    { decimal_digits: '2', force_decimal: true },
    { message: 'Недопустимая сумма!' },
  )
  @Min(0, { message: 'Сумма должна быть больше или равна 0.' })
  @Max(9999999.99, {
    message: 'Сумма должна быть меньше или равна 9999999,99',
  })
  amount: number;

  @IsBoolean()
  hidden: boolean;
}
