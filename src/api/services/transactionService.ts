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

export const transactionService = {
  getTransactions: (skip = 0, take = 10) =>
    apiClient<GetTransactionsResponse>('/v1/transactions', {
      params: { skip: String(skip), take: String(take) },
    }),
};
