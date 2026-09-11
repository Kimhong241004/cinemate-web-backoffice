import { apiClient } from "../clients/apiClient";

export type PromoCodeType = "movie" | "subscription";

export interface PromoCodeAssignedUser {
  global_id: string;
  name: string;
  username: string;
}

export interface PromoCodeFromApi {
  id: number;
  global_id: string;
  code: string;
  description: string;
  promo_code_type: PromoCodeType;
  discount_amount: number;
  discount_type: "percentage" | "amount";
  expires_at: string;
  usage_limit: number;
  used_count: number;
  status: number; // 1 = active, 0 = inactive
  visibility: "public" | "private";
  max_uses_per_user: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  /** Set when this code was created as part of a private-code generation batch */
  batch_id?: string;
  /** Only populated for private codes */
  assigned_users?: PromoCodeAssignedUser[];
}

export interface GetPromoCodesResponse {
  data: PromoCodeFromApi[];
  total: number;
  take: number;
  skip: number;
}

export interface CreatePromoCodePayload {
  code: string;
  description?: string;
  promo_code_type: PromoCodeType;
  discount_amount: number;
  discount_type: "percentage" | "amount";
  expires_at: string;
  usage_limit: number;
  status?: number;
}

export interface UpdatePromoCodePayload {
  code?: string;
  description?: string;
  promo_code_type?: PromoCodeType;
  discount_amount?: number;
  discount_type?: "percentage" | "amount";
  expires_at?: string;
  usage_limit?: number;
  status?: number;
}

export interface GetPromoCodesParams {
  skip?: number;
  take?: number;
  search?: string;
  discount_type?: "percentage" | "amount";
  promo_code_type?: PromoCodeType;
  visibility?: "public" | "private";
  status?: 0 | 1;
  /** Filter to codes generated together in this batch */
  batch_id?: string;
}

export interface GeneratePromoCodesPayload {
  /** Optional prefix prepended to each generated code, e.g. "cine-1sfvdf" */
  prefix?: string;
  total_promo_code: number;
  description?: string;
  promo_code_type?: PromoCodeType;
  discount_amount?: number;
  discount_type?: "percentage" | "amount";
  expires_at: string;
  usage_limit?: number;
  visibility?: "public" | "private";
  /** Ignored by the API for private codes — always forced to 1 */
  max_uses_per_user?: number;
}

export interface GeneratePromoCodesResponse {
  total_generated: number;
  data: PromoCodeFromApi[];
}

export interface PromoCodeBatch {
  batch_id: string;
  codes_count: number;
  description: string;
  promo_code_type: PromoCodeType;
  discount_amount: number;
  discount_type: "percentage" | "amount";
  visibility: "public" | "private";
  max_uses_per_user: number;
  usage_limit: number;
  expires_at: string;
  created_at: string;
}

export interface GetPromoCodeBatchesResponse {
  total: number;
  take: number;
  skip: number;
  data: PromoCodeBatch[];
}

export interface GetPromoCodeBatchesParams {
  skip?: number;
  take?: number;
  search?: string;
}

export const promoCodeService = {
  getPromoCodes: ({
    skip = 0,
    take = 10,
    search,
    discount_type,
    promo_code_type,
    visibility,
    status,
    batch_id,
  }: GetPromoCodesParams = {}) => {
    const params: Record<string, string> = {
      skip: String(skip),
      take: String(take),
    };
    if (search) params.search = search;
    if (discount_type) params.discount_type = discount_type;
    if (promo_code_type) params.promo_code_type = promo_code_type;
    if (visibility) params.visibility = visibility;
    if (status !== undefined) params.status = String(status);
    if (batch_id) params.batch_id = batch_id;
    return apiClient<GetPromoCodesResponse>("/v1/promo-codes", { params });
  },

  getPromoCode: (globalId: string) =>
    apiClient<PromoCodeFromApi>(`/v1/promo-codes/${globalId}`),

  createPromoCode: (payload: CreatePromoCodePayload) =>
    apiClient<PromoCodeFromApi>("/v1/promo-codes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updatePromoCode: (globalId: string, payload: UpdatePromoCodePayload) =>
    apiClient<PromoCodeFromApi>(`/v1/promo-codes/${globalId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deletePromoCode: (globalId: string) =>
    apiClient<void>(`/v1/promo-codes/${globalId}`, {
      method: "DELETE",
    }),

  generatePromoCodes: (payload: GeneratePromoCodesPayload) =>
    apiClient<GeneratePromoCodesResponse>("/v1/promo-codes/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getPromoCodeBatches: ({ skip = 0, take = 10, search }: GetPromoCodeBatchesParams = {}) => {
    const params: Record<string, string> = {
      skip: String(skip),
      take: String(take),
    };
    if (search) params.search = search;
    return apiClient<GetPromoCodeBatchesResponse>("/v1/promo-codes/batches", { params });
  },
};
