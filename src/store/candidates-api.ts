import { CREATECANDIDATE,GETCANDIDATES,DELETECANDIDATES,EDITCANDIDATE,UNBLOCKPROPOSALS,
  SETCANDIDATEIDENTITY } from "@/constants";
import type { Candidate,CreateCandidateRequest,EditCandidateRequest,
  SetIdentityRequest } from "@/types/candidate";
import { baseApi } from "./base-api";

export const candidatesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Django's getcandidate is a POST. Without a candidate_id it returns the whole list.
    getCandidates: build.query<Candidate[], void>({
      query: () => ({ url: GETCANDIDATES, method: "POST", body: {candidate_id:null} }),
      providesTags: ["Candidate"],
    }),
    getCandidate: build.query<Candidate, {candidate_id:number}>({
      query: ({candidate_id}) => ({ url: GETCANDIDATES, method: "POST", body: {candidate_id} }),
      providesTags: ["Candidate"],
    }),
    createCandidate: build.mutation<Candidate, CreateCandidateRequest>({
      query: (body) => ({ url: CREATECANDIDATE, method: "POST", body }),
      invalidatesTags: ["Candidate"],
    }),
    editCandidate: build.mutation<Candidate, EditCandidateRequest>({
      query: (body) => ({ url: EDITCANDIDATE, method: "POST", body }),
      invalidatesTags: ["Candidate"],
    }),
    deleteCandidate: build.mutation<Candidate, { candidate_id: number }>({
      query: ({ candidate_id }) => ({ url: DELETECANDIDATES, method: "POST", body: { candidate_id } }),
      invalidatesTags: ["Candidate"],
    }),
    // The sysadmin or MD allows new proposals again after a non-performance exit (a comment is required).
    unblockProposals: build.mutation<Candidate, { candidate_id: number; comment: string }>({
      query: (body) => ({ url: UNBLOCKPROPOSALS, method: "POST", body }),
      invalidatesTags: ["Candidate"], // the candidate, the lists and the life cycle refresh
    }),
    // Enter PAN and/or Aadhaar. "Proposal" too: a proposal shows what is still missing before the offer.
    setCandidateIdentity: build.mutation<Candidate, SetIdentityRequest>({
      query: (body) => ({ url: SETCANDIDATEIDENTITY, method: "POST", body }),
      invalidatesTags: ["Candidate", "Proposal"],
    }),
  }),
});

export const { 
  useGetCandidatesQuery, 
  useCreateCandidateMutation, 
  useDeleteCandidateMutation, 
  useEditCandidateMutation, 
  useGetCandidateQuery,
  useUnblockProposalsMutation,
  useSetCandidateIdentityMutation } = candidatesApi;