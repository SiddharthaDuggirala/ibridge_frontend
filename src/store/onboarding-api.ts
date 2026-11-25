import { GETONBOARDINGS, MOVEONBOARDING, MOVEEXIT } from "@/constants";
import type { MoveExitRequest, MoveOnboardingRequest, Onboarding } from "@/types/onboarding";
import { baseApi } from "./base-api";

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Every onboarding case this user may see (Django applies the same hierarchy rules as for proposals).
    getOnboardings: build.query<Onboarding[], void>({
      query: () => ({ url: GETONBOARDINGS, method: "POST", body: { onboarding_id: null } }),
      providesTags: ["Onboarding"],
    }),
    // An onboarding step also adds a line to the candidate's history, which the Proposal tag covers.
    moveOnboarding: build.mutation<Onboarding, MoveOnboardingRequest>({
      query: (body) => ({ url: MOVEONBOARDING, method: "POST", body }),
      invalidatesTags: ["Onboarding", "Proposal"],
    }),
    moveExit: build.mutation<Onboarding, MoveExitRequest>({
      query: (body) => ({ url: MOVEEXIT, method: "POST", body }),
      invalidatesTags: ["Onboarding", "Proposal"],
    }),
  }),
});

export const { useGetOnboardingsQuery, useMoveOnboardingMutation,useMoveExitMutation } = onboardingApi;
