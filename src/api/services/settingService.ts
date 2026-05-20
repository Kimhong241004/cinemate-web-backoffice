import { apiClient } from '../clients/apiClient';

export interface BakongSetting {
  merchantId: string;
  merchantName: string;
  merchantCity: string;
  currency: string;
}

export const settingService = {
  getBakong: () => apiClient<BakongSetting>('/v1/setting/bakong'),

  updateBakong: (payload: BakongSetting) =>
    apiClient<BakongSetting>('/v1/setting/bakong', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
