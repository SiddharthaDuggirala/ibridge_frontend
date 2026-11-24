import { GETPIPELINE } from "@/constants";

import type {Pipeline} from "@/types/pipeline";
import {baseApi} from "@/store/base-api";



export const pipelineApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // The counts are built from proposals and onboarding cases, so it refreshes whenever either changes.
        getPipeline: build.query<Pipeline, void>({
            query: () => ({url: GETPIPELINE, method:"POST", body: {}}),
            providesTags: ["Proposal", "Onboarding"],
        })
    })
});

export const {useGetPipelineQuery} = pipelineApi;

