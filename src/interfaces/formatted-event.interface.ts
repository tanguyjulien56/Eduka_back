export interface FormattedEvent {
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
  address: {
    id: string;
    address_line: string;
    zip_code: string;
    city: string;
    school_id: string | null;
  };
}
