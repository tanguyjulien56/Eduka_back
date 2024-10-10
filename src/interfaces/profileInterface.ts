export interface profileInterface {
  id: string;
  firstname: string;
  lastname: string;
  profil_picture: string; // Renomme si nécessaire pour correspondre au champ photo
  address: { address_line_1: string; zip_code: string; city: string };
  created_at: Date;
  children: Array<{
    id: string;
    name: string;
    birthday: Date; // Assure-toi que tu as besoin de cette information
    class: string;
    created_at: Date;
  }>;
}
