import { LOGIN } from "@/constants";
import type { LoginRequest, LoginResponse } from "@/types/auth";
import { baseApi } from "./base-api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: LOGIN,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;