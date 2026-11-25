import { GETLIFECYCLE } from "@/constants";
import type { Lifecycle } from "@/types/lifecycle";
import { baseApi } from "./base-api";

export const lifecycleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Built from the proposals, onboarding cases and exits, so it refreshes whenever any of them changes.
    getLifecycle: build.query<Lifecycle, { candidate_id: number }>({
      query: (body) => ({ url: GETLIFECYCLE, method: "POST", body }),
      providesTags: ["Candidate", "Proposal", "Onboarding"],
    }),
  }),
});

export const { useGetLifecycleQuery } = lifecycleApi;

