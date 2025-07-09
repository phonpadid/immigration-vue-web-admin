export interface PassportInformation {
  id: number;
  number: string;
  image: string;
  expiry_date: string;
  date_issue: string;
  place_issue: string;
}
export interface PersonalInformation {
  name: string;
  family_name: string;
  date_of_birth: string;
  place_of_birth: string;
  gender: "male" | "female";
  nationality: string;
  occupation: string;
}

export interface DeparturePaginatedResponse {
  id: number;
  departure_name: string;
  black_list: "available" | "unavailable";
  verification_code: string;
  verified_at: string | null;
  created_at: string;
  passport_information: PassportInformation;
  personal_information: PersonalInformation;
  last_leaving: string;
  verified_by_user: {
    email: string;
    profile: {
      image: string;
      first_name: string;
      last_name: string;
    };
  };
}

export interface DepartureFilters {
  departure_name?: string;
  passport_number?: string;
  is_verified?: string;
  black_list?: string;
  verification_code?: string;
  limit?: number;
  offset?: number;
}
