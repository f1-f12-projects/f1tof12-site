export interface Holiday {
  id: number;
  name: string;
  date: string;
  is_mandatory: boolean;
  financial_year_id: number;
  created_date: string;
  updated_date: string;
  selection_date?: string;
}

export interface HolidaysResponse {
  mandatory_holidays: Holiday[];
  selected_optional_holidays: Holiday[];
  available_optional_holidays: Holiday[];
}