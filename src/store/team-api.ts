import { GETTEAM, TRANSFEROWNERSHIP, ADDUSER, SETREPORTING } from "@/constants";
import type { TeamMember, TransferOwnershipRequest, TransferOwnershipResult, AddUserRequest,
  SetReportingRequest,
 } from "@/types/team";
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
    addUser: build.mutation<TeamMember,AddUserRequest>({
      query: (body) => ({url:ADDUSER, method:"POST", body}),
      invalidatesTags:["Team"],
    }),
    // A new manager changes who can see which candidates and proposals, so those lists refresh too.
    setReporting: build.mutation<TeamMember, SetReportingRequest>({
      query: (body) => ({ url: SETREPORTING, method: "POST", body }),
      invalidatesTags: ["Team", "Candidate", "Proposal"],
    }),
  }),
});

export const { useGetTeamQuery, useTransferOwnershipMutation,useAddUserMutation,
  useSetReportingMutation,
 } = teamApi;