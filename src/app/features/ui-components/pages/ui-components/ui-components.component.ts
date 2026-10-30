import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GlassButtonComponent } from '../../../../shared/components/glass-button/glass-button.component';

export interface SampleUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
  balance: number;
}

@Component({
  selector: 'app-ui-components',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GlassButtonComponent],
  templateUrl: './ui-components.component.html',
})
export class UiComponentsComponent {
  // Category tabs
  public activeCategory = signal<string>('all');

  // 1. Text Inputs & Validation
  public standardInput = 'Alexander Vance';
  public errorInput = 'invalid-email-format';
  public warningInput = 'weak_pass_123';
  public successInput = 'trader.pro@trackerpro.io';

  // 2. Switch
  public switchState = true;
  public darkThemeSwitch = false;

  // 3. Checkbox
  public checkbox1 = true;
  public checkbox2 = false;
  public checkboxIndeterminate = true;

  // 4. Radio Group
  public selectedRadio = 'limit';
  public radioOptions = [
    { value: 'market', label: 'Market Execution', desc: 'Instant fill at best market price' },
    { value: 'limit', label: 'Limit Order', desc: 'Execute when price hits desired target' },
    { value: 'stop', label: 'Stop Trigger', desc: 'Protective stop order triggered at threshold' },
  ];

  // 5. Pickers: Date, Time, DateTime
  public selectedDate = '2026-10-30';
  public selectedTime = '14:45';
  public selectedDateTime = '2026-10-30T14:45';

  // 6. Tag Input
  public tags = signal<string[]>(['Bitcoin', 'Ethereum', 'EUR/USD', 'Gold', 'Nasdaq']);
  public newTagInput = '';

  public addTag(): void {
    const val = this.newTagInput.trim();
    if (val && !this.tags().includes(val)) {
      this.tags.update((curr) => [...curr, val]);
      this.newTagInput = '';
    }
  }

  public removeTag(index: number): void {
    this.tags.update((curr) => curr.filter((_, i) => i !== index));
  }

  // 7. Textarea with Counter
  public textareaText = 'Pro algorithmic paper trading terminal with ultra-low latency simulated fills.';
  public maxChars = 200;

  // 8. File Input
  public isDraggingFile = false;
  public uploadedFiles = signal<
    { name: string; size: string; type: string; progress: number }[]
  >([
    { name: 'strategy-backtest-q3.json', size: '2.4 MB', type: 'application/json', progress: 100 },
    { name: 'tax-report-2025.csv', size: '840 KB', type: 'text/csv', progress: 100 },
  ]);

  public onFileSelected(event: any): void {
    const files = event.target.files as FileList;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        this.uploadedFiles.update((curr) => [
          ...curr,
          {
            name: f.name,
            size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: f.type || 'document',
            progress: 100,
          },
        ]);
      }
    }
  }

  public removeFile(idx: number): void {
    this.uploadedFiles.update((curr) => curr.filter((_, i) => i !== idx));
  }

  // 9. Group Tabs
  public activeGroupTab = signal<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  // 10. Multi-Step Wizard Form
  public wizardStep = signal<number>(1);
  public wizardData = {
    accountName: 'Quantitative Growth Alpha',
    currency: 'USD',
    riskTolerance: 'Balanced',
    enableLeverage: true,
    maxLeverage: 50,
  };

  public nextWizardStep(): void {
    if (this.wizardStep() < 4) {
      this.wizardStep.update((s) => s + 1);
    }
  }

  public prevWizardStep(): void {
    if (this.wizardStep() > 1) {
      this.wizardStep.update((s) => s - 1);
    }
  }

  public resetWizard(): void {
    this.wizardStep.set(1);
  }

  // 11. Table with Sorting, Filtering & Pagination
  public tableSearch = '';
  public tableStatusFilter = '';
  public sortColumn = signal<keyof SampleUser>('balance');
  public sortDirection = signal<'asc' | 'desc'>('desc');
  public currentPage = signal<number>(1);
  public pageSize = signal<number>(5);

  public readonly sampleUsers: SampleUser[] = [
    { id: 101, name: 'Alex Vance', email: 'alex@trackerpro.io', role: 'Lead Quant', status: 'Active', balance: 94500.5 },
    { id: 102, name: 'Elena Rostova', email: 'elena@hedgeline.com', role: 'Portfolio Manager', status: 'Active', balance: 142300.0 },
    { id: 103, name: 'Marcus Sterling', email: 'm.sterling@capital.uk', role: 'FX Trader', status: 'Active', balance: 68100.2 },
    { id: 104, name: 'Sofia Rodriguez', email: 'sofia@fintech.es', role: 'Risk Analyst', status: 'Pending', balance: 24900.0 },
    { id: 105, name: 'Daisuke Sato', email: 'daisuke@tokyo.jp', role: 'Algo Developer', status: 'Active', balance: 83450.75 },
    { id: 106, name: 'Chloe Dubois', email: 'chloe@geneve.ch', role: 'Derivatives Specialist', status: 'Inactive', balance: 12400.0 },
    { id: 107, name: 'Lucas Meyer', email: 'lucas@frankfurt.de', role: 'Options Trader', status: 'Active', balance: 110250.0 },
    { id: 108, name: 'Amina Al-Mansoor', email: 'amina@dubai.ae', role: 'Commodities Broker', status: 'Active', balance: 215000.0 },
  ];

  public readonly filteredTableData = computed(() => {
    let list = [...this.sampleUsers];
    const q = this.tableSearch.trim().toLowerCase();
    const status = this.tableStatusFilter;
    const col = this.sortColumn();
    const dir = this.sortDirection();

    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }

    if (status) {
      list = list.filter((u) => u.status === status);
    }

    list.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return dir === 'asc' ? valA - valB : valB - valA;
      }
      return dir === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return list;
  });

  public readonly paginatedTableData = computed(() => {
    const list = this.filteredTableData();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  public readonly totalPages = computed(() => {
    return Math.ceil(this.filteredTableData().length / this.pageSize()) || 1;
  });

  public setSort(col: keyof SampleUser): void {
    if (this.sortColumn() === col) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('desc');
    }
  }

  // 12. Skeleton Loader Demo Toggle
  public showSkeletonDemo = signal<boolean>(true);
}
