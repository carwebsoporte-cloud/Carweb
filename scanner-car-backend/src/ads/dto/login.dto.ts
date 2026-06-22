import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/** Credenciales de acceso al panel admin. */
export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  password!: string;
}
