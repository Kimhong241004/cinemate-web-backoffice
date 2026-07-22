import { apiClient } from '../clients/apiClient';

export interface TransactionUser {
  global_id: string;
  name: string;
  user_type: string;
  contact: string;
  profile_url: string | null;
}

export interface TransactionFromApi {
  global_id: string;
  transaction_id: string | null;
  amount: number;
  payment_method: string;
  payment_status: string;
  purchase_type: string;
  date: string;
  time: string;
  user: TransactionUser;
}

export interface TransactionSummary {
  total: number;
  locked: number;
  processing: number;
  bank_paid: number;
}

export interface GetTransactionsResponse {
  total: number;
  take: number;
  skip: number;
  summary: TransactionSummary;
  data: TransactionFromApi[];
}

export interface GetTransactionsFilters {
  type?: 'plan' | 'movie' | 'topup';
  payment_status?: 'pending' | 'paid' | 'failed';
  start_date?: string;
  end_date?: string;
}

export const transactionService = {
  getTransactions: (skip = 0, take = 10, filters: GetTransactionsFilters = {}) => {
    const params: Record<string, string> = { skip: String(skip), take: String(take) };
    if (filters.type) params.type = filters.type;
    if (filters.payment_status) params.payment_status = filters.payment_status;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    return apiClient<GetTransactionsResponse>('/v1/transactions', { params });
  },
};
