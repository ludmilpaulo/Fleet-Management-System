import { baseApi } from '@/lib/baseApi';

export const uploadsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    signUpload: b.mutation<unknown, { contentType: string }>({
      query: (body) => ({ url: '/uploads/sign', method: 'POST', body }),
    }),
    confirmUpload: b.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({ url: '/uploads/confirm', method: 'POST', body }),
      invalidatesTags: ['Inspection'],
    }),
  }),
});

export const { useSignUploadMutation, useConfirmUploadMutation } = uploadsApi;


