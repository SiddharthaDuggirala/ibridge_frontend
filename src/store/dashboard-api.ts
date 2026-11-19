import { GETDASHBOARD } from "@/constants";
import type { DashboardSummary } from "@/types/dashboard";
import { baseApi } from "./base-api";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<DashboardSummary, void>({
      query: () => GETDASHBOARD,
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;