import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogApiService } from '../../services/audit-log-api.service';
import {
  AuditLogEntry,
  AuditLogFilter,
  UserSummary,
} from '../../models/audit-log.models';
import { CetDatePipe } from '../../../../shared/pipes/cet-date.pipe';
import { ToastService } from '../../../../core/notifications/toast.service';
import { GlassDateTimePickerComponent } from '../../../../shared/components/glass-date-time-picker/glass-date-time-picker.component';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule, CetDatePipe, GlassDateTimePickerComponent],
  templateUrl: './audit-log.component.html',
})
export class AuditLogComponent implements OnInit {
  private readonly api = inject(AuditLogApiService);
  private readonly toast = inject(ToastService);

  public readonly logs = signal<AuditLogEntry[]>([]);
  public readonly totalCount = signal<number>(0);
  public readonly availableUsers = signal<UserSummary[]>([]);
  public readonly isLoading = signal<boolean>(false);
  public readonly isAdmin = signal<boolean>(false);

  // Filters
  public pageNumber = 1;
  public pageSize = 20;
  public searchTerm = '';
  public selectedActionType = '';
  public selectedUserId = '';

  // Stats
  public readonly successCount = signal<number>(0);
  public readonly avgDurationMs = signal<number>(0);

  // Inspection Modal
  public readonly selectedLog = signal<AuditLogEntry | null>(null);
  public readonly isDetailModalOpen = signal<boolean>(false);

  // Purge Modal
  public readonly isPurgeModalOpen = signal<boolean>(false);
  public purgeFromDate = '';
  public purgeToDate = '';
  public readonly isPurging = signal<boolean>(false);

  ngOnInit(): void {
    this.loadLogs();
  }

  public loadLogs(): void {
    this.isLoading.set(true);

    const filter: AuditLogFilter = {
      searchTerm: this.searchTerm.trim() || undefined,
      actionType: this.selectedActionType || undefined,
      filterUserId: this.selectedUserId || undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
    };

    this.api.getLogs(filter).subscribe({
      next: (res) => {
        const items = res.logs || [];
        this.logs.set(items);
        this.totalCount.set(res.totalCount || items.length);
        this.availableUsers.set(res.availableUsers || []);
        this.isAdmin.set(res.isAdmin);

        const successes = items.filter((x) => x.isSuccess).length;
        this.successCount.set(successes);

        const totalMs = items.reduce((sum, x) => sum + (x.executionDurationMs || 0), 0);
        this.avgDurationMs.set(items.length > 0 ? Math.round(totalMs / items.length) : 0);

        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toast.error('Audit Log Load Failed', err?.message || 'Could not retrieve audit trail.');
      },
    });
  }

  public inspectLog(log: AuditLogEntry): void {
    this.selectedLog.set(log);
    this.isDetailModalOpen.set(true);
  }

  public closeDetailModal(): void {
    this.isDetailModalOpen.set(false);
    this.selectedLog.set(null);
  }

  public formatJson(raw: string | null | undefined): string {
    if (!raw) return 'No payload recorded.';
    try {
      const parsed = JSON.parse(raw);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return raw;
    }
  }

  public copyPayload(): void {
    const l = this.selectedLog();
    if (!l?.payload) return;
    navigator.clipboard.writeText(l.payload).then(() => {
      this.toast.success('Copied', 'Payload copied to clipboard.');
    });
  }

  public deleteSingleLog(id: string): void {
    if (!confirm('Are you sure you want to delete this audit entry?')) return;
    this.api.deleteLog(id).subscribe({
      next: () => {
        this.toast.success('Deleted', 'Audit log entry removed.');
        this.loadLogs();
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

  public executePurgeRange(): void {
    this.isPurging.set(true);
    this.api.deleteLogsByDateRange(this.purgeFromDate || undefined, this.purgeToDate || undefined).subscribe({
      next: () => {
        this.isPurging.set(false);
        this.closePurgeModal();
        this.toast.success('Purged', 'Audit logs within range removed.');
        this.loadLogs();
      },
      error: (err) => {
        this.isPurging.set(false);
        this.toast.error('Purge Failed', err?.message || 'Server error.');
      },
    });
  }

  public executePurgeAll(): void {
    if (!confirm('DANGER: This will permanently delete ALL immutable audit logs. Continue?')) return;
    this.isPurging.set(true);
    this.api.purgeAll().subscribe({
      next: () => {
        this.isPurging.set(false);
        this.closePurgeModal();
        this.toast.success('Purged All', 'All audit log records permanently cleared.');
        this.loadLogs();
      },
      error: (err) => {
        this.isPurging.set(false);
        this.toast.error('Purge Failed', err?.message || 'Server error.');
      },
    });
  }

  public getActionBadgeColor(type: string): string {
    const lower = (type || '').toLowerCase();
    if (lower.includes('auth') || lower.includes('login')) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
    if (lower.includes('trading') || lower.includes('order')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (lower.includes('delete') || lower.includes('purge')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    if (lower.includes('admin') || lower.includes('role')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
  }
}
