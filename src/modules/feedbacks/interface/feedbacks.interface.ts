import type {
  IOffsetBasePaginate,
  IPaginated,
} from "@/common/interface/pagination.interface";

export type FeedbackTableState = IOffsetBasePaginate & {
  is_published?: string;
};

export type FeedbackResponse = {
  id: number;
  name: string;
  tel: string;
  email: string;
  message: string;
  media: string;
  is_published: boolean;
  created_at: string;
};

export interface FeedbacksResponse extends IPaginated {
  feedbacks: FeedbackResponse[];
}
