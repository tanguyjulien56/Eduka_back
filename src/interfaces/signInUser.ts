import { RoleName } from '@prisma/client';

export default interface SignInUserInterface {
  id: string;
  email: string;
  status: string;
  role: RoleName;
}
