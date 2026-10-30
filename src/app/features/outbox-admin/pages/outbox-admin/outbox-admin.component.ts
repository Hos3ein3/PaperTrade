import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OutboxApiService } from '../../services/outbox-api.service';
import {
  OutboxMessage,
  InboxMessage,
  OutboxFilter,
  InboxFilter,
  OutboxPayloadResponse,
} from '../../models/outbox.models';
import { CetDatePipe } from '../../../../shared/pipes/cet-date.pipe';
import { ToastService } from '../../../../core/notifications/toast.service';

@Component({
  selector: 'app-outbox-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, CetDatePipe],
  templateUrl: './outbox-admin.component.html',
})
export class OutboxAdminComponent implements OnInit {
  private readonly api = inject(OutboxApiService);
  private readonly toast = inject(ToastService);

  public readonly activeTab = signal<'outbox' | 'inbox'>('outbox');
  public readonly isLoading = signal<boolean>(false);

  // Outbox State
  public readonly outboxMessages = signal<OutboxMessage[]>([]);
  public readonly totalOutboxCount = signal<number>(0);
  public readonly pendingCount = signal<number>(0);
  public readonly processedCount = signal<number>(0);
  public readonly failedCount = signal<number>(0);
  public outboxPageNumber = 1;
  public outboxPageSize = 15;
  public outboxSearch = '';
  public outboxStatusFilter: 'all' | 'pending' | 'done' | 'failed' = 'all';

  // Inbox State
  public readonly inboxMessages = signal<InboxMessage[]>([]);
  public readonly totalInboxCount = signal<number>(0);
  public inboxPageNumber = 1;
  public inboxPageSize = 15;
  public inboxSearch = '';

  // Payload Modal
  public readonly selectedPayload = signal<OutboxPayloadResponse | null>(null);
  public readonly isPayloadModalOpen = signal<boolean>(false);
  public readonly isLoadingPayload = signal<boolean>(false);

  // Purge Modal
  public readonly isPurgeModalOpen = signal<boolean>(false);
  public purgeFromDate = '';
  public purgeToDate = '';
  public readonly isPurging = signal<boolean>(false);

  ngOnInit(): void {
    this.loadOutbox();
    this.loadInbox();
  }

  public setTab(tab: 'outbox' | 'inbox'): void {
    this.activeTab.set(tab);
    if (tab === 'outbox') {
      this.loadOutbox();
    } else {
      this.loadInbox();
    }
  }

  public loadOutbox(): void {
    this.isLoading.set(true);
    let isDone: boolean | null = null;
    if (this.outboxStatusFilter === 'done') isDone = true;
    if (this.outboxStatusFilter === 'pending') isDone = false;

    const filter: OutboxFilter = {
      searchTerm: this.outboxSearch || undefined,
      isDone: isDone,
      pageNumber: this.outboxPageNumber,
      pageSize: this.outboxPageSize,
      sortBy: 'OccurredOnUtc',
      sortDescending: true,
    };

    this.api.getOutboxMessages(filter).subscribe({
      next: (res) => {
        let items = res.messages || [];
        if (this.outboxStatusFilter === 'failed') {
          items = items.filter((m) => m.retryCount > 0 || !!m.error);
        }
        this.outboxMessages.set(items);
        this.totalOutboxCount.set(res.totalCount || items.length);
        this.pendingCount.set(res.pendingCount || 0);
        this.processedCount.set(res.processedCount || 0);
        this.failedCount.set(res.failedCount || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error('Outbox Load Failed', err?.message || 'Could not fetch outbox events.');
      },
    });
  }

  public loadInbox(): void {
    this.isLoading.set(true);
    const filter: InboxFilter = {
      searchTerm: this.inboxSearch || undefined,
      pageNumber: this.inboxPageNumber,
      pageSize: this.inboxPageSize,
      sortBy: 'ReceivedOnUtc',
      sortDescending: true,
    };

    this.api.getInboxMessages(filter).subscribe({
      next: (res) => {
        this.inboxMessages.set(res.messages || []);
        this.totalInboxCount.set(res.totalCount || res.totalProcessedCount || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error('Inbox Load Failed', err?.message || 'Could not fetch inbox events.');
      },
    });
  }

  public viewPayload(id: string): void {
    this.isLoadingPayload.set(true);
    this.isPayloadModalOpen.set(true);
    this.api.getOutboxPayload(id).subscribe({
      next: (res) => {
        this.selectedPayload.set(res);
        this.isLoadingPayload.set(false);
      },
      error: (err) => {
        this.isLoadingPayload.set(false);
        this.toast.error('Payload Error', err?.message || 'Unable to retrieve JSON payload.');
      },
    });
  }

  public closePayloadModal(): void {
    this.isPayloadModalOpen.set(false);
    this.selectedPayload.set(null);
  }

  public formatJson(raw: string | undefined): string {
    if (!raw) return '{}';
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  }

  public copyPayload(): void {
    const p = this.selectedPayload();
    if (!p) return;
    navigator.clipboard.writeText(p.payload).then(() => {
      this.toast.success('Copied', 'JSON payload copied to clipboard.');
    });
  }

  public retry(id: string): void {
    this.api.retryMessage(id).subscribe({
      next: () => {
        this.toast.success('Dispatched', 'Outbox message retry count cleared for re-processing.');
        this.loadOutbox();
      },
      error: (err) => {
        this.toast.error('Retry Failed', err?.message || 'Server error.');
      },
    });
  }

  public deleteOutbox(id: string): void {
    if (!confirm('Are you sure you want to permanently delete this outbox message?')) return;
    this.api.deleteOutbox(id).subscribe({
      next: () => {
        this.toast.success('Deleted', 'Outbox message removed.');
        this.loadOutbox();
      },
      error: (err) => {
        this.toast.error('Delete Failed', err?.message || 'Server error.');
      },
    });
  }

  public deleteInbox(id: string): void {
    if (!confirm('Are you sure you want to delete this deduplicated inbox message?')) return;
    this.api.deleteInbox(id).subscribe({
      next: () => {
        this.toast.success('Deleted', 'Inbox message removed.');
        this.loadInbox();
      },
      error: (err) => {
        this.toast.error('Delete Failed', err?.message || 'Server error.');
      },
    });
  }

  public openPurgeModal(): void {
    this.purgeFromDate = '';
    this.purgeToDate = '';
    this.isPurgeModalOpen.set(true);
  }

  public closePurgeModal(): void {
    this.isPurgeModalOpen.set(false);
  }

  public executePurge(): void {
    this.isPurging.set(true);
    if (this.activeTab() === 'outbox') {
      this.api.deleteOutboxByDateRange(this.purgeFromDate || undefined, this.purgeToDate || undefined).subscribe({
        next: () => {
          this.isPurging.set(false);
          this.closePurgeModal();
          this.toast.success('Purged', 'Outbox messages within range deleted.');
          this.loadOutbox();
        },
        error: (err) => {
          this.isPurging.set(false);
          this.toast.error('Purge Failed', err?.message || 'Server error.');
        },
      });
    } else {
      this.api.deleteInboxByDateRange(this.purgeFromDate || undefined, this.purgeToDate || undefined).subscribe({
        next: () => {
          this.isPurging.set(false);
          this.closePurgeModal();
          this.toast.success('Purged', 'Inbox messages within range deleted.');
          this.loadInbox();
        },
        error: (err) => {
          this.isPurging.set(false);
          this.toast.error('Purge Failed', err?.message || 'Server error.');
        },
      });
    }
  }

  public getEventShortName(eventType: string): string {
    if (!eventType) return 'Event';
    const parts = eventType.split('.');
    return parts[parts.length - 1];
  }
}
