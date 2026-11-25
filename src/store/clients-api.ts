import {CREATECLIENT, GETCLIENTS,EDITCLIENT } from "@/constants";
import { type EditClientRequest, type Client, type CreateClientRequest } from "@/types/client";
import { baseApi } from "./base-api";

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Django's getclients is a POST. client_id null = the whole list.
    getClients: build.query<Client[], void>({
      query: () => ({ url: GETCLIENTS, method: "POST", body: { client_id: null } }),
      providesTags: ["Client"],
    }),
    createClient: build.mutation<Client[],CreateClientRequest>({
      query: (body) => ({url:CREATECLIENT, method:"POST", body}),
      invalidatesTags: ["Client"],
    }),
    editClient: build.mutation<Client[], EditClientRequest>({
      query:(body) => ({url:EDITCLIENT, method:"POST", body}),
      invalidatesTags: ["Client"],
    }),
  }),
});

export const { useGetClientsQuery, useCreateClientMutation, useEditClientMutation } = clientsApi;