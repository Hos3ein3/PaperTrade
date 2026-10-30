export interface OutboxMessage {
  id: string;
  eventType: string;
  payload: string;
  occurredOnUtc: string;
  processedOnUtc?: string | null;
  error?: string | null;
  retryCount: number;
}

export interface InboxMessage {
  id: string;
  handlerName: string;
  receivedOnUtc: string;
  processedOnUtc: string;
}

export interface OutboxFilter {
  searchTerm?: string;
  isDone?: boolean | null;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface InboxFilter {
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface OutboxListResponse {
  messages: OutboxMessage[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  searchTerm?: string;
  isDone?: boolean | null;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
  pendingCount: number;
  processedCount: number;
  failedCount: number;
}

export interface InboxListResponse {
  messages: InboxMessage[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDescending?: boolean;
  totalProcessedCount: number;
}

export interface OutboxPayloadResponse {
  id: string;
  eventType: string;
  occurredOnUtc: string;
  processedOnUtc?: string | null;
  retryCount: number;
  error?: string | null;
  payload: string;
}
