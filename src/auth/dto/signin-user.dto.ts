import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInUserDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password:string;
}

const users: Array<{ id: number;  name: string}> = [
  { id: 1, name: 'toto' },
  { id: 2, name: 'tata' },
  { id: 3, name: 'tutu' }
]

// // résultat souhaité
// const usersId: { id: number }[] = [
//   { id: 1 },
//   { id: 2 },
//   { id: 3 }
// ]

const userId = users.map((user) => {user.id})