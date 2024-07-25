import { JsonValue } from '@prisma/client/runtime/library';

export interface Location {
  type: string;
  lat: number;
  long: number;
}
export interface CardEvent {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  guest_limit: number;
  is_public: boolean;
  category: string;
  user_id: string;
  status: string;
  tags: string[];
  city: string;
  location: JsonValue;
  lastname: string;
  firstname: string;
  profil_picture: string;
  event_picture: string;
}
