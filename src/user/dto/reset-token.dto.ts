// src/user/dto/reset-token.dto.ts
export class ResetTokenDto {
  userId: string;
  token: string;
  expiry: Date;
}
