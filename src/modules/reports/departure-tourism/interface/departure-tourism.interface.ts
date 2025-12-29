export interface DepartureTourismReport {
  total_departure_today: number;
  total_departure_month_days: number;
  total_departure_one_year: number;
  total_departure_all: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}
