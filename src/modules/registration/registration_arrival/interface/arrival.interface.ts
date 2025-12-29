import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type ArrivalTableState = IOffsetBasePaginate & {
  entry_name?: string;
  passport_number?: string;
  visa_number?: string;
  is_verified?: "verified" | "no_verified";
  black_list?: "available" | "unavailable";
  verification_code?: string;
};

export type ListArrival = {
  id: number;
  entry_name: string;
  black_list: "available" | "unavailable";
  verification_code: string;
  verified_at?: string;
  created_at: string;
  passport_information: {
    id: number;
    number: string;
  };
  visa_information: {
    id: number;
    number: string;
  };
};

export type Arrival = {
  id: number;
  entry_name: string;
  purpose:
    | "diplomatic"
    | "official"
    | "visit"
    | "business"
    | "tourism"
    | "transit";
  traveling_by_type: "flight" | "car" | "bus";
  traveling_by_no: string;
  traveling_from: string;
  is_traveling_in_tour: string;
  verification_code?: string;
  verified_at?: string;
  black_list: "available" | "unavailable";
  check_in_date: string;
  created_at: string;
  updated_at: string;
  passport_information: {
    id: number;
    number: string;
    expiry_date: string;
    date_issue: string;
    place_issue: string;
    image: string;
    people_image: string;
    created_at: string;
    updated_at: string;
  };
  visa_information: {
    id: number;
    visaCategory: string;

    number: string;
    date_issue: string;
    place_issue: string;
    image: string;
    created_at: string;
    updated_at: string;
  };
  personal_information: {
    id: number;
    family_name: string;
    name: string;
    gender: "male" | "female";
    date_of_birth: string;
    place_of_birth: string;
    nationality: string;
    occupation: string;
    phone_number: string;
    race: string;
  };
  intended_address: {
    id: number;
    name: string;
    province: string;
    district: string;
    village: string;
    check_in: string;
    check_out: string;
  }[];
};
/****************************************************************** */
export interface ExportFilters {
  entry_name?: string;
  passport_number?: string;
  visa_number?: string;
  black_list?: string;
  is_verified?: string;
  verification_code?: string;
  start_date?: string;
  end_date?: string;
}
export interface ArrivalDetail {
  id: number;
  entry_name: string;
  black_list: "available" | "unavailable";
  verification_code: string;
  verified_at: string | null;
  created_at: string;
  purpose:
    | "business"
    | "diplomatic"
    | "official"
    | "tourism"
    | "transit"
    | "visit";
  is_traveling_in_tour: string;
  traveling_by_type: "flight" | "car" | "bus";
  traveling_by_no: string;
  traveling_from: string;
  passport_information: {
    id: number;
    number: string;
    expiry_date: string;
    date_issue: string;
    place_issue: string;
    image: string;
    people_image: string;
  };
  visa_information: {
    id: number;
    number: string;
    visaCategory: string;
    date_issue: string;
    place_issue: string;
    image: string;
  };
  verified_by_user: {
    id: number;
    email: string;

    profile: {
      image: string;
      first_name: string;
      last_name: string;
    };
  };

  personal_information: {
    name: string;
    family_name: string;
    date_of_birth: string;
    place_of_birth: string;
    gender: "male" | "female";
    nationality: string;
    race: string;
    occupation: string;
    phone_number: string;
  };
  intended_address?: Array<{
    name: string;
    village: string;
    district: string;
    province: string;
    check_in: string;
    check_out: string;
  }>;
}

/****************************************************************** */

// types/scanner.types.ts
export type ScannerType = "arrival" | "departure";

// export interface ArrivalPaginatedResponse extends IPaginated {
//   data: ListArrival[];
// }
export interface ArrivalPaginatedResponse extends IPaginated, ListArrival {
  data: ListArrival[];
}
