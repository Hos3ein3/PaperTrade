export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  actionType: string;
  actionName: string;
  payload?: string | null;
  executionDurationMs: number;
  isSuccess: boolean;
  errorMessage?: string | null;
  ipAddress?: string | null;
  impersonatedByAdminId?: string | null;
  timestamp: string;
}

export interface UserSummary {
  id: string;
  email?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuditLogFilter {
  actionType?: string;
  searchTerm?: string;
  filterUserId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AuditLogListResponse {
  logs: AuditLogEntry[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  actionType?: string;
  searchTerm?: string;
  filterUserId?: string;
  availableUsers: UserSummary[];
  isAdmin: boolean;
  isImpersonating: boolean;
  currentTenantId: string;
  currentUserId: string;
}
