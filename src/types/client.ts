export interface Client {
  id: number;
  name: string | null;
  industry: string | null;
  country: string | null;
  currency: string | null;
  // "dd/mm/YYYY" (Django sets it to the day the client was added), or null.
  since: string | null;
  is_active: boolean;
  // "dd/mm/YYYY HH:MM:SS"
  created_at: string;   
  }

  export interface CreateClientRequest{
  name: string;
  industry: string;
  country: string;
  currency: string;
  }

  export type EditClientRequest = CreateClientRequest & { client_id: number; is_active: boolean };