export class ChangePasswordDto {
  userId: string;
  newPassword: string;
}
export class ResetPasswordDto {
  newPassword: string;
  resetToken: string;
}
