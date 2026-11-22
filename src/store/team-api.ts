import { GETTEAM, TRANSFEROWNERSHIP } from "@/constants";
import type { TeamMember, TransferOwnershipRequest, TransferOwnershipResult } from "@/types/team";
import { baseApi } from "./base-api";

export const teamApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTeam: build.query<TeamMember[], void>({
      query: () => ({ url: GETTEAM, method: "POST", body: {} }),
      providesTags: ["Team"],
    }),
    // Owners change on candidates and proposals too, so all three lists refresh.
    transferOwnership: build.mutation<TransferOwnershipResult, TransferOwnershipRequest>({
      query: (body) => ({ url: TRANSFEROWNERSHIP, method: "POST", body }),
      invalidatesTags: ["Team", "Candidate", "Proposal"],
    }),
  }),
});

export const { useGetTeamQuery, useTransferOwnershipMutation } = teamApi;