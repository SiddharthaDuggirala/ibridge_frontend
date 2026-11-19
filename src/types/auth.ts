export interface LoginRequest {
    username: string;
    password: string;
  }


export interface LoginResponse {
    user: {
      id: number;
      name: string;
      email: string;
      username: string;
    };
    token: string;
    role: string | null;
  }