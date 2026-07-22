import { apiClient } from "../clients/apiClient";

export type PromoCodeType = "movie" | "subscription";

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
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
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
  status?: 0 | 1;
}

export const promoCodeService = {
  getPromoCodes: ({
    skip = 0,
    take = 10,
    search,
    discount_type,
    status,
  }: GetPromoCodesParams = {}) => {
    const params: Record<string, string> = {
      skip: String(skip),
      take: String(take),
    };
    if (search) params.search = search;
    if (discount_type) params.discount_type = discount_type;
    if (status !== undefined) params.status = String(status);
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
};
