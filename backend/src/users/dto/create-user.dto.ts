import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6, { message: 'Пароль не может быть меньше 6 символов' })
  password: string;

  @IsString()
  @MinLength(0)
  @MaxLength(200)
  about: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
    message: 'Invalid image URL',
  })
  avatar: string;
}
