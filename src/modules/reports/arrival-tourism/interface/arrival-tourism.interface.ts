export interface ArrivalTourismReport {
  total_arrival_today: number;
  total_arrival_month_days: number;
  total_arrival_one_year: number;
  total_arrival_all: number;
  total_arrival_tourism_today: number;
  total_arrival_tourism_month_days: number;
  total_arrival_tourism_one_year: number;
  total_arrival_tourism_all: number;
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
