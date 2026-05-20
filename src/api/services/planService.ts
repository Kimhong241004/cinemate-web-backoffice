import { apiClient } from '../clients/apiClient';

export interface PlanFromApi {
  id: number;
  global_id: string;
  name: string;
  description: string;
  billing_cycle: 'monthly' | 'yearly' | 'weekly';
  price: number;
  status: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface GetPlansResponse {
  total: number;
  take: number;
  skip: number;
  data: PlanFromApi[];
}

export interface GetPlansParams {
  skip?: number;
  take?: number;
  search?: string;
  billing_cycle?: 'monthly' | 'yearly' | 'weekly';
  status?: number;
}

export interface CreatePlanData {
  name: string;
  description: string;
  billing_cycle: 'monthly' | 'yearly' | 'weekly';
  price: number;
  status: number;
}

export interface UpdatePlanData {
  name?: string;
  description?: string;
  billing_cycle?: 'monthly' | 'yearly' | 'weekly';
  price?: number;
  status?: number;
}

export const planService = {
  getPlans: (params?: GetPlansParams) => {
    const query: Record<string, string> = {};
    if (params?.skip !== undefined) query.skip = String(params.skip);
    if (params?.take !== undefined) query.take = String(params.take);
    if (params?.search) query.search = params.search;
    if (params?.billing_cycle) query.billing_cycle = params.billing_cycle;
    if (params?.status !== undefined) query.status = String(params.status);
    return apiClient<GetPlansResponse>('/v1/plans', { params: query });
  },

  getPlan: (globalId: string) =>
    apiClient<PlanFromApi>(`/v1/plans/${globalId}`),

  createPlan: (data: CreatePlanData) =>
    apiClient<PlanFromApi>('/v1/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePlan: (globalId: string, data: UpdatePlanData) =>
    apiClient<PlanFromApi>(`/v1/plans/${globalId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deletePlan: (globalId: string) =>
    apiClient<void>(`/v1/plans/${globalId}`, { method: 'DELETE' }),
};