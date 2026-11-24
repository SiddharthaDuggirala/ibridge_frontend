import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
  } from "@reduxjs/toolkit/query/react";
  
  import { BASE_URL } from "@/constants";
  import type { ApiEnvelope, ApiError } from "@/types/api";
  import { clearToken, getToken } from "./token";

  
  
  // 1. The plain request: base URL + token header.
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Token ${token}`);
      }
      return headers;
    },
  });
  
  // Is this body the { success, data, ... } wrapper?
  function isEnvelope(body: unknown): body is ApiEnvelope<unknown> {
    return typeof body === "object" && body !== null && "success" in body && "data" in body;
  }
  
  // Pull one readable message out of any Django error body.
  function messageFrom(body: unknown, fallback: string): string {
    if (typeof body !== "object" || body === null) return fallback;
    const b = body as Record<string, unknown>;
  
    // iBridge wrapper: { errors: ["No employees found"] }
    if (Array.isArray(b.errors) && b.errors.length > 0) return b.errors.join(", ");
    // DRF / Knox: { detail: "Invalid token." }
    if (typeof b.detail === "string") return b.detail;
    // DRF validation: { non_field_errors: ["Incorrect Credentials"] } or { username: ["..."] }
    const firstList = Object.values(b).find((v) => Array.isArray(v) && v.length > 0);
    if (Array.isArray(firstList)) return String(firstList[0]);
  
    return fallback;
  }

  function toApiError(error: FetchBaseQueryError): ApiError {
    if (typeof error.status === "number") {
      return { status: error.status, message: messageFrom(error.data, `Request failed (${error.status})`) };
    }
    if (error.status === "FETCH_ERROR") {
      return { status: error.status, message: "Can't reach the server. Is Django running?" };
    }
    if (error.status === "PARSING_ERROR") {
      return { status: error.originalStatus, message: `Server error (${error.originalStatus})` };
    }
    return { status: error.status, message: error.error };
  }
  const baseQuery: BaseQueryFn<string | FetchArgs, unknown, ApiError> = async (
    args,
    api,
    extraOptions,
  ) => {
    const result = await rawBaseQuery(args, api, extraOptions);
  
    if (result.error) {
      // Token expired or invalid: forget it and go to the login page.
      if (result.error.status === 401 && getToken()) {
        clearToken();
        window.location.assign("/login");
      }
      return { error: toApiError(result.error) };
    }
  
    const body = result.data;
    if (isEnvelope(body)) {
      if (body.success === false) {
        return { error: { status: result.meta?.response?.status ?? 200, message: messageFrom(body, "Request failed") } };
      }
      return { data: body.data }; // pages only see "data"
    }
    return { data: body }; // login has no wrapper
  };
  
  // 3. The one API every feature file adds its endpoints to.
  export const baseApi = createApi({
    reducerPath: "api",
    tagTypes: ["Candidate", "Proposal", "Client", "Team", "Onboarding"],
    baseQuery,
    endpoints: () => ({}),
  });

// One person in Django's getteam list (system admin only).
export interface TeamMember {
  id: number;
  name: string;
  username: string;
  role: { shortcode: string; name: string };
  is_active: boolean;
  // What they own today: recruiters own candidates, Leads own the proposals they made.
  owns: { candidates: number; proposals: number };
}

export interface TransferOwnershipRequest {
  from_user_id: number;
  to_user_id: number;
  deactivate: boolean;
}

export interface TransferOwnershipResult {
  candidates_moved: number;
  proposals_moved: number;
  deactivated: boolean;
}