import { CREATEPROPOSAL, GETPROPOSALHISTORY, GETPROPOSALS, MOVEPROPOSAL,
  EDITPROPOSAL
 } from "@/constants";
import type { CreateProposalRequest, MoveProposalRequest, Proposal, ProposalHistoryEntry,
  EditProposalRequest
 } from "@/types/proposal";
import { baseApi } from "./base-api";

export const proposalsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Every proposal this user may see (Django filters by role).
    getProposals: build.query<Proposal[], void>({
      query: () => ({ url: GETPROPOSALS, method: "POST", body: { proposal_id: null, candidate_id: null } }),
      providesTags: ["Proposal"],
    }),
    // A new proposal also changes the candidate rows (their `proposals` list and can_edit),
    // so it refreshes both lists.
    createProposal: build.mutation<Proposal, CreateProposalRequest>({
      query: (body) => ({ url: CREATEPROPOSAL, method: "POST", body }),
      invalidatesTags: ["Proposal", "Candidate"],
    }),
    // Only the stored rate changes, so only the Proposals page needs to refresh.
    editProposal: build.mutation<Proposal, EditProposalRequest>({
      query: (body) => ({ url: EDITPROPOSAL, method: "POST", body }),
      invalidatesTags: ["Proposal"],
    }),
    // Moving a proposal changes its stage, which both the Proposals page and the candidate rows show.
    moveProposal: build.mutation<Proposal, MoveProposalRequest>({
      query:(body) => ({url: MOVEPROPOSAL, method: "POST", body}),
      invalidatesTags: ["Proposal", "Candidate"],
    }),
    getProposalHistory: build.query<ProposalHistoryEntry[], { proposal_id: number }>({
      query: ({ proposal_id }) => ({ url: GETPROPOSALHISTORY, method: "POST", body: { proposal_id } }),
      providesTags: ["Proposal"],
    }),
  }),
});

export const { useGetProposalsQuery, useCreateProposalMutation, 
  useGetProposalHistoryQuery,
  useMoveProposalMutation,useEditProposalMutation } = proposalsApi;