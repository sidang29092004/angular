import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { initialCatalog } from '../data/music-data';
import { Catalog, Feedback } from '../models/music';

@Injectable({ providedIn: 'root' })
export class MusicService {
  private readonly http = inject(HttpClient);
  private pending = false;
  readonly catalog = signal<Catalog>(initialCatalog);
  readonly status = signal<'loading' | 'live' | 'offline'>('loading');

  load(): void {
    if (this.pending) return;
    this.pending = true;
    this.status.set('loading');
    this.http.get<Catalog>('/api/catalog').pipe(timeout(15000)).subscribe({
      next: (catalog) => {
        this.catalog.set(this.readSavedCatalog() ?? catalog);
        this.status.set('live');
        this.pending = false;
      },
      error: () => {
        this.catalog.set(this.readSavedCatalog() ?? this.catalog());
        this.status.set('offline');
        this.pending = false;
      },
    });
  }

  saveCatalog(catalog: Catalog): void {
    this.catalog.set(catalog);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('spotife.admin.catalog', JSON.stringify(catalog));
      }
    } catch {
      // The current session still works if browser storage is unavailable.
    }
  }

  private readSavedCatalog(): Catalog | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const saved = localStorage.getItem('spotife.admin.catalog');
      if (!saved) return null;
      const catalog = JSON.parse(saved) as Catalog;
      if (!Array.isArray(catalog.playlists) || !Array.isArray(catalog.tracks)
        || !Array.isArray(catalog.artists) || !Array.isArray(catalog.feedbacks)) return null;
      return catalog;
    } catch {
      return null;
    }
  }

  subscribe(email: string) {
    return this.http.post<{ message: string }>('/api/subscribers', { email }).pipe(timeout(15000));
  }

  sendFeedback(value: { name: string; rating: number; quote: string }) {
    return this.http.post<Feedback>('/api/feedbacks', value).pipe(timeout(15000));
  }
}
