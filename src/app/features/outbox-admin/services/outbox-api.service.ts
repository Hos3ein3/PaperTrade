import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Url } from '../../../core/url-builder/url';
import {
  OutboxFilter,
  InboxFilter,
  OutboxListResponse,
  InboxListResponse,
  OutboxPayloadResponse,
} from '../models/outbox.models';

@Injectable({
  providedIn: 'root',
})
export class OutboxApiService {
  private readonly http = inject(HttpClient);

  public getOutboxMessages(filter?: OutboxFilter): Observable<OutboxListResponse> {
    const url = Url.build(Url.OutboxAdmin.Outbox, undefined, filter as Record<string, any>);
    return this.http.get<OutboxListResponse>(url);
  }

  public getInboxMessages(filter?: InboxFilter): Observable<InboxListResponse> {
    const url = Url.build(Url.OutboxAdmin.Inbox, undefined, filter as Record<string, any>);
    return this.http.get<InboxListResponse>(url);
  }

  public getOutboxPayload(id: string): Observable<OutboxPayloadResponse> {
    const url = Url.build(Url.OutboxAdmin.Payload, { id });
    return this.http.get<OutboxPayloadResponse>(url);
  }

  public retryMessage(id: string): Observable<any> {
    const url = Url.build(Url.OutboxAdmin.Retry, { id });
    return this.http.post<any>(url, {});
  }

  public deleteOutbox(id: string): Observable<any> {
    const url = Url.build(Url.OutboxAdmin.Delete);
    return this.http.post<any>(url, { id });
  }

  public deleteOutboxByDateRange(fromDate?: string, toDate?: string): Observable<any> {
    const url = Url.build(Url.OutboxAdmin.DeleteByDateRange);
    return this.http.post<any>(url, { fromDate, toDate });
  }

  public deleteInbox(id: string): Observable<any> {
    const url = Url.build(Url.OutboxAdmin.DeleteInbox);
    return this.http.post<any>(url, { id });
  }

  public deleteInboxByDateRange(fromDate?: string, toDate?: string): Observable<any> {
    const url = Url.build(Url.OutboxAdmin.DeleteInboxByDateRange);
    return this.http.post<any>(url, { fromDate, toDate });
  }
}
