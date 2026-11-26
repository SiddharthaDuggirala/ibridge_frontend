import { GETATTENTION } from "@/constants";
import type { Attention } from "@/types/attention";
import { baseApi } from "@/store/base-api";

export const attentionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Built from proposals, onboarding cases and exits, so it refreshes whenever one of them changes.
    getAttention: build.query<Attention, void>({
      query: () => ({ url: GETATTENTION, method: "POST", body: {} }),
      providesTags: ["Proposal", "Onboarding"],
    }),
  }),
}); 

export const { useGetAttentionQuery } = attentionApi;