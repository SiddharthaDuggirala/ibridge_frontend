import { GETCLIENTS } from "@/constants";
import type { Client } from "@/types/client";
import { baseApi } from "./base-api";

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Django's getclients is a POST. client_id null = the whole list.
    getClients: build.query<Client[], void>({
      query: () => ({ url: GETCLIENTS, method: "POST", body: { client_id: null } }),
      providesTags: ["Client"],
    }),
  }),
});

export const { useGetClientsQuery } = clientsApi;