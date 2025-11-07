import { apiService } from './apiService';
import { ApiResponse } from '../models/ApiResponse';
import { HolidaysResponse } from '../models/Holiday';
import { FinancialYear } from '../models/FinancialYear';
import { cacheService } from './cacheService';

export const holidayService = {
  getMyHolidays: async (financialYearId: number): Promise<ApiResponse<HolidaysResponse>> => {
    const endpoint = process.env.REACT_APP_GET_HOLIDAYS_ENDPOINT?.replace('{financial_year_id}', financialYearId.toString()) || '';
    return apiService.get(endpoint);
  },

  getFinancialYears: async (): Promise<ApiResponse<FinancialYear[]>> => {
    const cacheKey = 'financial_years';
    const cached = cacheService.get(cacheKey);
    if (cached) return cached as ApiResponse<FinancialYear[]>;
    
    const response = await apiService.get(process.env.REACT_APP_GET_FY_ENDPOINT!) as ApiResponse<FinancialYear[]>;
    if (response.success) {
      cacheService.set(cacheKey, response);
    }
    return response;
  },

  selectOptionalHolidays: async (holidayIds: number[], financialYearId: number): Promise<ApiResponse<{ selected_holidays: number[] }>> => {
    const endpoint = process.env.REACT_APP_SELECT_OPTIONAL_HOILDAYS_ENDPOINT?.replace('{financial_year_id}', financialYearId.toString()) || '';
    return apiService.post(endpoint, {
      holiday_ids: holidayIds
    });
  }
};