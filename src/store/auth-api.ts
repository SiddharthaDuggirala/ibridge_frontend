import { LOGIN, CHANGEPASSWORD } from "@/constants";
import type { LoginRequest, LoginResponse, ChangePasswordRequest, ChangePasswordResult } from "@/types/auth";
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
    changePassword: build.mutation<ChangePasswordResult,ChangePasswordRequest>({
      query:(body) => ({
        url: CHANGEPASSWORD,
        method:"POST",
        body,

      }),

    })
  }),
});

export const { useLoginMutation, useChangePasswordMutation } = authApi;