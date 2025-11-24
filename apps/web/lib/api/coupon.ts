import { apiClient } from './client';

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
  baseFare?: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  data?: {
    valid: boolean;
    coupon: {
      code: string;
      discountType: 'eliminate_fee' | 'fixed_discount' | 'percentage_discount';
      discountValue?: number;
      description?: string;
    };
    discount: number;
    discountedSubtotal: number;
    gst: number;
    newTotal: number;
  };
  message?: string;
}

export const couponAPI = {
  validateCoupon: async (data: ValidateCouponRequest): Promise<ValidateCouponResponse> => {
    try {
      const response = await apiClient.post('/coupons/validate', data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        return {
          success: false,
          message: axiosError.response?.data?.message || 'Failed to validate coupon',
        };
      }
      return {
        success: false,
        message: 'An unknown error occurred',
      };
    }
  },
};
