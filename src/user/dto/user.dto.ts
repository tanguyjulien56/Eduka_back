export class AddressDto {
  readonly address_line: string;
  readonly zip_code: string;
  readonly city: string;
}

export class ProfileDto {
  readonly lastname: string;
  readonly firstname: string;
  readonly photo: string;
  readonly address: AddressDto;
}

export class CreateUserDto {
  readonly email: string;
  readonly password: string;
  readonly status: string;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly profile: ProfileDto;
  readonly schools: {
    school_id: number;
  };
  readonly roles: {
    role_id: number;
  }[];
}