import { RoleName } from '@prisma/client';

export default interface SingInUserInterface {
  id: string;
  email: string;
  status: string;
  role: RoleName;
}
