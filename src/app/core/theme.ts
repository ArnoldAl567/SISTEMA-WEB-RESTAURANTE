import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const key = 'sazon-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.read());

  constructor() {
    this.apply(this.theme());
    window.addEventListener('storage', event => {
      if (event.key === key) {
        const theme = this.read();
        this.theme.set(theme);
        this.apply(theme);
      }
    });
  }

  toggle() {
    const theme: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(theme);
    this.apply(theme);
    try { localStorage.setItem(key, theme); } catch { /* Storage can be disabled. */ }
  }

  private read(): Theme {
    try { return localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  }

  private apply(theme: Theme) {
    document.documentElement.dataset['theme'] = theme;
    document.documentElement.style.colorScheme = theme;
  }
}
