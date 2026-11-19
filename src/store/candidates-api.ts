import { CREATECANDIDATE,GETCANDIDATES,DELETECANDIDATES,EDITCANDIDATE } from "@/constants";
import type { Candidate,CreateCandidateRequest,EditCandidateRequest } from "@/types/candidate";
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
  }),
});

export const { 
  useGetCandidatesQuery, 
  useCreateCandidateMutation, 
  useDeleteCandidateMutation, 
  useEditCandidateMutation, 
  useGetCandidateQuery } = candidatesApi;