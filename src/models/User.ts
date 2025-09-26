export interface User {
  username: string;
  email: string;
  phone_number: string;
  given_name: string | null;
  family_name: string | null;
  status: string;
  created: string;
  enabled: boolean;
  role?: string;
}

export interface UserResponse {
  users: User[];
}