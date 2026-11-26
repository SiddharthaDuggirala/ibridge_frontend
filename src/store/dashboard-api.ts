import { GETDASHBOARD } from "@/constants";
import type { DashboardSummary } from "@/types/dashboard";
import { baseApi } from "./base-api";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<DashboardSummary, void>({
      query: () => GETDASHBOARD,
      // The numbers are built from all of these, so they refresh whenever one of them changes.
      providesTags: ["Candidate", "Proposal", "Onboarding", "Client", "Team"],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;