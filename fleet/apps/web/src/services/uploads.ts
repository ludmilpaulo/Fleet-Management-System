import { baseApi } from '@/lib/baseApi';
import { API_CONFIG } from '@/config/api';

export const uploadsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    signUpload: b.mutation<unknown, { contentType: string }>({
      query: (body) => ({ url: API_CONFIG.ENDPOINTS.UPLOADS.SIGN, method: 'POST', body }),
    }),
    confirmUpload: b.mutation<unknown, Record<string, unknown>>({
      query: (body) => ({ url: API_CONFIG.ENDPOINTS.UPLOADS.CONFIRM, method: 'POST', body }),
      invalidatesTags: ['Inspection', 'Upload'],
    }),
  }),
});

export const { useSignUploadMutation, useConfirmUploadMutation } = uploadsApi;


