export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
}


export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    password: string;
    gender: string;
  }) => Promise<void>;
  logout: () => void;
}

export interface LoginResponse {
  token: string;
}
