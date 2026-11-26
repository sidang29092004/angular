import { afterNextRender, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly theme = signal<AppTheme>('dark');

  constructor() {
    afterNextRender(() => {
      this.initTheme();
    });
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  toggleTheme(): void {
    const nextTheme: AppTheme = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  setTheme(theme: AppTheme): void {
    this.theme.set(theme);
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      localStorage.setItem('spotife-theme', theme);
    } catch {
      // Storage unavailable in restricted mode
    }

    this.applyThemeToDOM(theme);
  }

  private initTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let savedTheme: AppTheme | null = null;
    try {
      const stored = localStorage.getItem('spotife-theme');
      if (stored === 'dark' || stored === 'light') {
        savedTheme = stored;
      }
    } catch {
      // Ignore storage errors
    }

    if (!savedTheme) {
      const hasMatchMedia = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
      const prefersDark = hasMatchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
      savedTheme = prefersDark ? 'dark' : 'light';
    }

    this.theme.set(savedTheme);
    this.applyThemeToDOM(savedTheme);

    // Listen for OS theme preference changes if user hasn't explicitly set preference
    try {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          const hasManualSetting = localStorage.getItem('spotife-theme');
          if (!hasManualSetting) {
            const newTheme: AppTheme = e.matches ? 'dark' : 'light';
            this.theme.set(newTheme);
            this.applyThemeToDOM(newTheme);
          }
        });
      }
    } catch {
      // matchMedia listener not supported
    }
  }

  private applyThemeToDOM(theme: AppTheme): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    // Update mobile theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#080a08' : '#f5f7f4');
    }
  }
}
