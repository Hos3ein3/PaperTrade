import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Url } from '../../../core/url-builder/url';
import {
  AuditLogFilter,
  AuditLogListResponse,
} from '../models/audit-log.models';

@Injectable({
  providedIn: 'root',
})
export class AuditLogApiService {
  private readonly http = inject(HttpClient);

  public getLogs(filter?: AuditLogFilter): Observable<AuditLogListResponse> {
    const url = Url.build(Url.AuditLog.Logs, undefined, filter as Record<string, any>);
    return this.http.get<AuditLogListResponse>(url);
  }

  public deleteLog(id: string): Observable<any> {
    const url = Url.build(Url.AuditLog.Delete, { id });
    return this.http.delete<any>(url);
  }

  public deleteLogsByUser(userId: string): Observable<any> {
    const url = Url.build(Url.AuditLog.DeleteByUser, { userId });
    return this.http.delete<any>(url);
  }

  public deleteLogsByDateRange(fromDate?: string, toDate?: string): Observable<any> {
    const url = Url.build(Url.AuditLog.DeleteByDateRange);
    return this.http.post<any>(url, { fromDate, toDate });
  }

  public purgeAll(): Observable<any> {
    const url = Url.build(Url.AuditLog.PurgeAll);
    return this.http.post<any>(url, {});
  }
}
