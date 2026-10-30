import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'slate' | 'teal' | 'emerald' | 'violet' | 'amber';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_MODE_KEY = 'tp_theme_mode';
  private readonly THEME_ACCENT_KEY = 'tp_theme_accent';

  public readonly isDark = signal<boolean>(true);
  public readonly accent = signal<AccentColor>('teal');

  constructor() {
    // Read saved preference or default to dark (optimal for trading terminals)
    try {
      const savedMode = localStorage.getItem(this.THEME_MODE_KEY) as ThemeMode | null;
      if (savedMode) {
        this.isDark.set(savedMode === 'dark');
      } else {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
        this.isDark.set(prefersDark);
      }

      const savedAccent = localStorage.getItem(this.THEME_ACCENT_KEY) as AccentColor | null;
      if (savedAccent) {
        this.accent.set(savedAccent);
      }
    } catch {
      this.isDark.set(true);
    }

    // Effect to apply classes to HTML root element
    effect(() => {
      const dark = this.isDark();
      const acc = this.accent();

      if (dark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }

      document.documentElement.setAttribute('data-theme', acc);

      try {
        localStorage.setItem(this.THEME_MODE_KEY, dark ? 'dark' : 'light');
        localStorage.setItem(this.THEME_ACCENT_KEY, acc);
      } catch {}
    });
  }

  public toggleDarkMode(): void {
    this.isDark.update((v) => !v);
  }

  public setDarkMode(dark: boolean): void {
    this.isDark.set(dark);
  }

  public setAccent(acc: AccentColor): void {
    this.accent.set(acc);
  }
}
